/**
 * 게시판 관련 상태 관리 스토어
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  BoardProfile, 
  BoardPost, 
  BoardComment,
  PostListResponse 
} from '../types/board';
import { 
  nicknameService, 
  postService, 
  commentService,
  likeService 
} from '../services/board/boardService';
import { useUserStore } from './user';

export const useBoardStore = defineStore('board', () => {
  // 상태
  const profile = ref<BoardProfile | null>(null);
  const currentNickname = ref<string | null>(null);
  const posts = ref<BoardPost[]>([]);
  const currentPage = ref(1);
  const currentCategory = ref<string>('general');
  const hasMore = ref(true);
  const totalCount = ref(0);
  const isLoading = ref(false);
  const lastFetch = ref<number | null>(null);
  const cacheTimeout = 5 * 60 * 1000; // 5분
  const selectedPost = ref<BoardPost | null>(null);
  const currentComments = ref<BoardComment[]>([]);
  const userLikedPosts = ref<Set<string>>(new Set());
  const userLikedComments = ref<Set<string>>(new Set());

  // 계산된 속성
  const hasNickname = computed(() => !!currentNickname.value);
  const needsRefresh = computed(() => {
    if (!lastFetch.value) return true;
    return Date.now() - lastFetch.value > cacheTimeout;
  });

  /**
   * 프로필 확인 및 초기화
   */
  async function checkProfile() {
    const userStore = useUserStore();
    console.log('[boardStore] checkProfile 시작', { user: userStore.currentUser });
    
    if (!userStore.currentUser) {
      console.log('[boardStore] 사용자 없음');
      return null;
    }

    try {
      console.log('[boardStore] nicknameService.getProfile 호출');
      const profileData = await nicknameService.getProfile(userStore.currentUser.id);
      console.log('[boardStore] nicknameService.getProfile 결과:', profileData);
      
      if (profileData) {
        profile.value = profileData;
        currentNickname.value = profileData.nickname;
      }
      return profileData;
    } catch (error) {
      console.error('[boardStore] 프로필 로드 실패:', error);
      return null;
    }
  }

  /**
   * 닉네임 초기화/로드
   */
  async function initializeNickname() {
    const userStore = useUserStore();
    if (!userStore.currentUser) return;

    try {
      const nickname = await nicknameService.getCurrentNickname(userStore.currentUser.id);
      currentNickname.value = nickname;
      return nickname;
    } catch (error) {
      console.error('닉네임 초기화 실패:', error);
      return null;
    }
  }

  /**
   * 닉네임 설정/변경
   */
  async function setNickname(nickname: string) {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    // 유효성 검사
    if (!nicknameService.validateNickname(nickname)) {
      throw new Error('닉네임은 2-15자의 한글, 영문, 숫자만 사용 가능합니다.');
    }

    try {
      await nicknameService.saveOrUpdateNickname(userStore.currentUser.id, nickname);
      currentNickname.value = nickname;
      return true;
    } catch (error) {
      console.error('닉네임 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 게시글 목록 로드
   */
  async function loadPosts(forceRefresh = false) {
    console.log('[boardStore] loadPosts 시작', {
      forceRefresh,
      currentPage: currentPage.value,
      currentCategory: currentCategory.value,
      isLoading: isLoading.value
    });
    
    if (isLoading.value) {
      console.log('[boardStore] 이미 로딩 중, 종료');
      return;
    }

    // 캐시 확인
    if (!forceRefresh && posts.value.length > 0 && !needsRefresh.value) {
      console.log('[boardStore] 캐시 사용');
      return posts.value;
    }

    isLoading.value = true;
    try {
      console.log('[boardStore] postService.getPosts 호출', {
        page: currentPage.value,
        limit: 20,
        category: currentCategory.value
      });
      
      const response = await postService.getPosts(
        currentPage.value, 
        20, 
        currentCategory.value
      );
      
      console.log('[boardStore] postService.getPosts 응답', response);
      
      if (currentPage.value === 1) {
        posts.value = response.posts;
      } else {
        posts.value.push(...response.posts);
      }
      
      totalCount.value = response.totalCount;
      hasMore.value = response.hasMore;
      lastFetch.value = Date.now();
      
      // 사용자 좋아요 정보 로드
      if (response.posts.length > 0) {
        await loadUserLikes(response.posts.map(p => p.id), 'post');
      }
      
      console.log('[boardStore] loadPosts 성공');
      return posts.value;
    } catch (error) {
      console.error('[boardStore] 게시글 로드 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 다음 페이지 로드
   */
  async function loadNextPage() {
    if (!hasMore.value || isLoading.value) return;

    currentPage.value++;
    await loadPosts();
  }

  /**
   * 게시글 새로고침
   */
  async function refreshPosts() {
    currentPage.value = 1;
    hasMore.value = true;
    posts.value = [];
    await loadPosts(true);
  }

  /**
   * 게시글 검색
   */
  async function searchPosts(query: string) {
    if (!query.trim()) {
      return refreshPosts();
    }

    isLoading.value = true;
    try {
      const response = await postService.searchPosts(query, 1);
      posts.value = response.posts;
      totalCount.value = response.totalCount;
      hasMore.value = false; // 검색 결과는 페이징 없음
      
      // 사용자 좋아요 정보 로드
      await loadUserLikes(response.posts.map(p => p.id), 'post');
    } catch (error) {
      console.error('게시글 검색 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 게시글 상세 로드
   */
  async function loadPost(postId: string) {
    try {
      const post = await postService.getPost(postId);
      if (post) {
        selectedPost.value = post;
        // 댓글도 함께 로드
        await loadComments(postId);
        // 좋아요 정보 로드
        await loadUserLikes([postId], 'post');
      }
      return post;
    } catch (error) {
      console.error('게시글 상세 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 게시글 작성
   */
  async function createPost(postData: { title: string; content: string; category: string; shared_reading_id?: string | null }) {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    // 닉네임 확인
    if (!currentNickname.value) {
      throw new Error('닉네임을 먼저 설정해주세요.');
    }

    console.log('[board.ts] createPost 호출, postData:', postData);
    console.log('[board.ts] content 값:', postData.content);
    console.log('[board.ts] content 타입:', typeof postData.content);
    console.log('[board.ts] content 길이:', postData.content?.length);

    try {
      const newPost = await postService.createPost(
        userStore.currentUser.id,
        postData.title,
        postData.content,
        postData.category,
        postData.shared_reading_id || undefined
      );
      
      // 목록 맨 앞에 추가
      posts.value.unshift(newPost);
      totalCount.value++;
      
      return newPost;
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 게시글 수정
   */
  async function updatePost(postId: string, updates: { title?: string; content?: string; category?: string; shared_reading_id?: string | null }) {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    try {
      await postService.updatePost(postId, userStore.currentUser.id, updates);
      
      // 로컬 상태 업데이트
      const index = posts.value.findIndex(p => p.id === postId);
      if (index !== -1) {
        posts.value[index] = {
          ...posts.value[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
      }
      
      if (selectedPost.value?.id === postId) {
        selectedPost.value = {
          ...selectedPost.value,
          ...updates,
          updated_at: new Date().toISOString()
        };
      }
      
      return true;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 게시글 삭제
   */
  async function deletePost(postId: string) {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    try {
      await postService.deletePost(postId, userStore.currentUser.id);
      
      // 로컬 상태에서 제거
      posts.value = posts.value.filter(p => p.id !== postId);
      totalCount.value--;
      
      if (selectedPost.value?.id === postId) {
        selectedPost.value = null;
      }
      
      return true;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 댓글 로드
   */
  async function loadComments(postId: string) {
    try {
      const comments = await commentService.getCommentsWithReplies(postId);
      currentComments.value = comments;
      
      // 댓글 좋아요 정보 로드
      const commentIds: string[] = [];
      comments.forEach(comment => {
        commentIds.push(comment.id);
        if (comment.replies) {
          commentIds.push(...comment.replies.map(r => r.id));
        }
      });
      
      if (commentIds.length > 0) {
        await loadUserLikes(commentIds, 'comment');
      }
      
      return comments;
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 댓글 작성
   */
  async function createComment(postId: string, content: string, parentId?: string) {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    if (!currentNickname.value) {
      throw new Error('닉네임을 먼저 설정해주세요.');
    }

    try {
      const newComment = await commentService.createComment(
        postId,
        userStore.currentUser.id,
        content,
        parentId
      );
      
      // 댓글 목록 새로고침
      await loadComments(postId);
      
      // 게시글 댓글 수 업데이트
      if (selectedPost.value?.id === postId) {
        selectedPost.value.comment_count++;
      }
      
      const postIndex = posts.value.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        posts.value[postIndex].comment_count++;
      }
      
      return newComment;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 댓글 삭제
   */
  async function deleteComment(commentId: string, postId: string) {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    try {
      await commentService.deleteComment(commentId, userStore.currentUser.id);
      
      // 댓글 목록 새로고침
      await loadComments(postId);
      
      // 게시글 댓글 수 업데이트
      if (selectedPost.value?.id === postId) {
        selectedPost.value.comment_count--;
      }
      
      const postIndex = posts.value.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        posts.value[postIndex].comment_count--;
      }
      
      return true;
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 좋아요 토글
   */
  async function toggleLike(targetId: string, targetType: 'post' | 'comment') {
    const userStore = useUserStore();
    if (!userStore.currentUser) throw new Error('로그인이 필요합니다.');

    try {
      const liked = await likeService.toggleLike(userStore.currentUser.id, targetId, targetType);
      
      // 로컬 상태 업데이트
      if (targetType === 'post') {
        if (liked) {
          userLikedPosts.value.add(targetId);
        } else {
          userLikedPosts.value.delete(targetId);
        }
        
        // 게시글 좋아요 수 업데이트
        const post = posts.value.find(p => p.id === targetId);
        if (post) {
          post.like_count += liked ? 1 : -1;
        }
        
        if (selectedPost.value?.id === targetId) {
          selectedPost.value.like_count += liked ? 1 : -1;
        }
      } else {
        if (liked) {
          userLikedComments.value.add(targetId);
        } else {
          userLikedComments.value.delete(targetId);
        }
        
        // 댓글 좋아요 수 업데이트
        currentComments.value.forEach(comment => {
          if (comment.id === targetId) {
            comment.like_count += liked ? 1 : -1;
          } else if (comment.replies) {
            const reply = comment.replies.find(r => r.id === targetId);
            if (reply) {
              reply.like_count += liked ? 1 : -1;
            }
          }
        });
      }
      
      return liked;
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 좋아요 정보 로드
   */
  async function loadUserLikes(targetIds: string[], targetType: 'post' | 'comment') {
    const userStore = useUserStore();
    if (!userStore.currentUser || targetIds.length === 0) return;

    try {
      const likedSet = await likeService.checkUserLiked(
        userStore.currentUser.id,
        targetIds,
        targetType
      );
      
      if (targetType === 'post') {
        userLikedPosts.value = likedSet;
      } else {
        userLikedComments.value = likedSet;
      }
    } catch (error) {
      console.error('좋아요 정보 로드 실패:', error);
    }
  }

  /**
   * 좋아요 여부 확인
   */
  function isLiked(targetId: string, targetType: 'post' | 'comment'): boolean {
    if (targetType === 'post') {
      return userLikedPosts.value.has(targetId);
    } else {
      return userLikedComments.value.has(targetId);
    }
  }

  /**
   * 스토어 초기화
   */
  function resetStore() {
    profile.value = null;
    currentNickname.value = null;
    posts.value = [];
    currentPage.value = 1;
    hasMore.value = true;
    totalCount.value = 0;
    isLoading.value = false;
    lastFetch.value = null;
    selectedPost.value = null;
    currentComments.value = [];
    userLikedPosts.value = new Set();
    userLikedComments.value = new Set();
  }

  return {
    // 상태
    profile,
    currentNickname,
    posts,
    currentPage,
    currentCategory,
    hasMore,
    totalCount,
    isLoading,
    selectedPost,
    currentComments,
    userLikedPosts,
    userLikedComments,
    
    // 계산된 속성
    hasNickname,
    needsRefresh,
    
    // 메서드
    checkProfile,
    initializeNickname,
    setNickname,
    fetchPosts: loadPosts,
    fetchPost: loadPost,
    loadPosts,
    loadNextPage,
    refreshPosts,
    searchPosts,
    loadPost,
    createPost,
    updatePost,
    deletePost,
    loadComments,
    createComment,
    deleteComment,
    toggleLike,
    isLiked,
    resetStore
  };
});
