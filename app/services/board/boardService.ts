/**
 * 게시판 서비스
 * 비밀의 화원 게시판 관련 모든 API 호출을 담당
 */

import { supabase } from '../../services/supabase';
import type { 
  BoardProfile, 
  BoardPost, 
  BoardComment, 
  BoardLike,
  BoardReport 
} from '../../types/board';

/**
 * 닉네임 관련 서비스
 */
export const nicknameService = {
  /**
   * 사용자 프로필 조회
   */
  async getProfile(userId: string): Promise<BoardProfile | null> {
    console.log('[nicknameService] getProfile 호출', { userId });
    
    try {
      console.log('[nicknameService] Supabase 쿼리 실행');
      const { data, error } = await supabase
        .from('board_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('[nicknameService] Supabase 응답', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          // 프로필이 없는 경우
          console.log('[nicknameService] 프로필 없음');
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[nicknameService] 프로필 조회 실패:', error);
      return null;
    }
  },

  /**
   * 사용자의 현재 닉네임 조회
   */
  async getCurrentNickname(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('board_profiles')
        .select('nickname')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 프로필이 없는 경우
          return null;
        }
        throw error;
      }

      return data?.nickname || null;
    } catch (error) {
      console.error('닉네임 조회 실패:', error);
      return null;
    }
  },

  /**
   * 닉네임 저장 또는 업데이트
   * upsert를 사용하여 한 번의 쿼리로 처리
   */
  async saveOrUpdateNickname(userId: string, nickname: string): Promise<boolean> {
    try {
      // 닉네임 유효성 검사
      if (!this.validateNickname(nickname)) {
        throw new Error('닉네임은 2-15자의 한글, 영문, 숫자만 사용 가능합니다.');
      }

      const { error } = await supabase
        .from('board_profiles')
        .upsert({
          user_id: userId,
          nickname: nickname,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
      throw error;
    }
  },

  /**
   * 닉네임 유효성 검사
   */
  validateNickname(nickname: string): boolean {
    // 2-15자, 한글/영문/숫자만
    const regex = /^[가-힣a-zA-Z0-9]{2,15}$/;
    return regex.test(nickname);
  },

  /**
   * 닉네임 존재 여부 확인 (선택적 - 중복 허용하므로 사용하지 않을 수도 있음)
   */
  async checkNicknameExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('board_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('닉네임 존재 확인 실패:', error);
      return false;
    }
  }
};

/**
 * 게시글 관련 서비스
 */
export const postService = {
  /**
   * 게시글 목록 조회 (무한 스크롤)
   */
  async getPosts(page: number = 1, limit: number = 20, category?: string): Promise<{
    posts: BoardPost[];
    totalCount: number;
    hasMore: boolean;
  }> {
    console.log('[postService] getPosts 호출', { page, limit, category });
    
    try {
      // 현재 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[postService] 현재 세션:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      });

      const offset = (page - 1) * limit;

      let query = supabase
        .from('board_posts')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      // 카테고리 필터 추가
      if (category && category !== 'all') {
        console.log('[postService] 카테고리 필터 추가:', category);
        query = query.eq('category', category);
      }

      console.log('[postService] Supabase 쿼리 실행');
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      console.log('[postService] Supabase 응답', { 
        dataLength: data?.length || 0, 
        count, 
        error,
        firstPost: data?.[0] ? { id: data[0].id, title: data[0].title } : null
      });

      if (error) {
        console.error('[postService] Supabase 오류 상세:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      const result = {
        posts: data || [],
        totalCount: count || 0,
        hasMore: offset + limit < (count || 0)
      };
      
      console.log('[postService] getPosts 최종 결과:', {
        postsCount: result.posts.length,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      });
      return result;
    } catch (error) {
      console.error('[postService] 게시글 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 상세 조회
   */
  async getPost(postId: string): Promise<BoardPost | null> {
    try {
      const { data, error } = await supabase
        .from('board_posts')
        .select('*')
        .eq('id', postId)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;

      // 조회수 증가 (별도 트랜잭션)
      await this.incrementViewCount(postId);

      return data;
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      return null;
    }
  },

  /**
   * 게시글 작성
   */
  async createPost(
    userId: string,
    title: string,
    content: string,
    category: string = 'general',
    sharedReadingId?: string
  ): Promise<BoardPost> {
    console.log('[boardService.createPost] 호출 매개변수:', {
      userId,
      title,
      content,
      contentType: typeof content,
      contentLength: content?.length,
      category,
      sharedReadingId
    });
    
    try {
      // 현재 닉네임 가져오기
      const nickname = await nicknameService.getCurrentNickname(userId);
      if (!nickname) {
        throw new Error('닉네임을 먼저 설정해주세요.');
      }

      const insertData = {
        user_id: userId,
        nickname,
        title,
        content,
        category,
        shared_reading_id: sharedReadingId || null
      };
      
      console.log('[boardService.createPost] DB에 삽입할 데이터:', JSON.stringify(insertData));

      const { data, error } = await supabase
        .from('board_posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 수정
   */
  async updatePost(
    postId: string,
    userId: string,
    updates: { title?: string; content?: string }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  },

  /**
   * 게시글 삭제 (소프트 삭제)
   */
  async deletePost(postId: string, userId: string, reason?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_posts')
        .update({
          is_deleted: true,
          deleted_reason: reason || '사용자 삭제',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 조회수 증가
   */
  async incrementViewCount(postId: string): Promise<void> {
    try {
      // 현재 조회수를 먼저 가져오기
      const { data: currentData, error: fetchError } = await supabase
        .from('board_posts')
        .select('view_count')
        .eq('id', postId)
        .single();

      if (fetchError) {
        console.error('현재 조회수 조회 실패:', fetchError);
        return;
      }

      const currentCount = currentData?.view_count || 0;

      // 조회수 업데이트
      const { error: updateError } = await supabase
        .from('board_posts')
        .update({ 
          view_count: currentCount + 1
        })
        .eq('id', postId);

      if (updateError) {
        console.error('조회수 업데이트 실패:', updateError);
      }
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
  },

  /**
   * 게시글 검색
   */
  async searchPosts(query: string, page: number = 1, limit: number = 20): Promise<{
    posts: BoardPost[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('board_posts')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        posts: data || [],
        totalCount: count || 0,
        hasMore: offset + limit < (count || 0)
      };
    } catch (error) {
      console.error('게시글 검색 실패:', error);
      throw error;
    }
  }
};

/**
 * 댓글 관련 서비스 (2뎁스 지원)
 */
export const commentService = {
  /**
   * 댓글 목록 조회 (트리 구조)
   */
  async getCommentsWithReplies(postId: string): Promise<BoardComment[]> {
    try {
      // 모든 댓글 조회
      const { data: comments, error } = await supabase
        .from('board_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!comments) return [];

      // 트리 구조로 변환
      const commentTree: BoardComment[] = [];
      const commentMap: Record<string, BoardComment> = {};

      // 1차 댓글 먼저 처리
      comments.forEach(comment => {
        if (comment.depth === 1) {
          commentMap[comment.id] = { ...comment, replies: [] };
          commentTree.push(commentMap[comment.id]);
        }
      });

      // 대댓글 연결
      comments.forEach(comment => {
        if (comment.depth === 2 && comment.parent_id && commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies!.push(comment);
        }
      });

      return commentTree;
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      return [];
    }
  },

  /**
   * 댓글 작성
   */
  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentId?: string
  ): Promise<BoardComment> {
    try {
      // 현재 닉네임 가져오기
      const nickname = await nicknameService.getCurrentNickname(userId);
      if (!nickname) {
        throw new Error('닉네임을 먼저 설정해주세요.');
      }

      // 댓글 깊이 결정
      let depth = 1;
      if (parentId) {
        // 부모 댓글 깊이 확인
        const { data: parentComment } = await supabase
          .from('board_comments')
          .select('depth')
          .eq('id', parentId)
          .single();

        // 2뎁스까지만 허용
        if (parentComment && parentComment.depth >= 2) {
          throw new Error('대댓글의 대댓글은 작성할 수 없습니다.');
        }
        depth = 2;
      }

      // 댓글 생성
      const { data, error } = await supabase
        .from('board_comments')
        .insert({
          post_id: postId,
          parent_id: parentId || null,
          user_id: userId,
          nickname,
          content,
          depth
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  },

  /**
   * 댓글 삭제 (소프트 삭제)
   */
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_comments')
        .update({
          is_deleted: true
        })
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  }
};

/**
 * 좋아요 관련 서비스
 */
export const likeService = {
  /**
   * 좋아요 토글
   */
  async toggleLike(
    userId: string,
    targetId: string,
    targetType: 'post' | 'comment'
  ): Promise<boolean> {
    try {
      // 기존 좋아요 확인
      const { data: existing } = await supabase
        .from('board_likes')
        .select('id')
        .eq('user_id', userId)
        .eq(targetType === 'post' ? 'post_id' : 'comment_id', targetId)
        .single();

      if (existing) {
        // 좋아요 취소
        const { error } = await supabase
          .from('board_likes')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return false; // 좋아요 취소됨
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('board_likes')
          .insert({
            user_id: userId,
            [targetType === 'post' ? 'post_id' : 'comment_id']: targetId
          });

        if (error) throw error;
        return true; // 좋아요 추가됨
      }
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      throw error;
    }
  },

  /**
   * 사용자가 좋아요 했는지 확인
   */
  async checkUserLiked(
    userId: string,
    targetIds: string[],
    targetType: 'post' | 'comment'
  ): Promise<Set<string>> {
    try {
      const { data } = await supabase
        .from('board_likes')
        .select(targetType === 'post' ? 'post_id' : 'comment_id')
        .eq('user_id', userId)
        .in(targetType === 'post' ? 'post_id' : 'comment_id', targetIds);

      const likedSet = new Set<string>();
      if (data) {
        data.forEach(item => {
          const id = item[targetType === 'post' ? 'post_id' : 'comment_id'];
          if (id) likedSet.add(id);
        });
      }

      return likedSet;
    } catch (error) {
      console.error('좋아요 확인 실패:', error);
      return new Set();
    }
  }
};

/**
 * 신고 관련 서비스
 */
export const reportService = {
  /**
   * 신고하기
   */
  async createReport(
    userId: string,
    targetId: string,
    targetType: 'post' | 'comment',
    reason: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_reports')
        .insert({
          reported_by: userId,
          [targetType === 'post' ? 'post_id' : 'comment_id']: targetId,
          reason
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('신고 실패:', error);
      throw error;
    }
  }
};
