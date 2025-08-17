/**
 * 게시판 관련 타입 정의
 */

/**
 * 게시글 카테고리
 */
export type BoardCategory = 'general' | 'love' | 'career' | 'daily' | 'question';

/**
 * 게시판 프로필 (닉네임)
 */
export interface BoardProfile {
  id: string;
  user_id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

/**
 * 게시글
 */
export interface BoardPost {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  content: string;
  category: BoardCategory;
  shared_reading_id?: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_deleted: boolean;
  deleted_reason?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 댓글 (2뎁스 지원)
 */
export interface BoardComment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  user_id: string;
  nickname: string;
  content: string;
  depth: 1 | 2;
  like_count: number;
  is_deleted: boolean;
  created_at: string;
  replies?: BoardComment[]; // 대댓글 배열 (클라이언트에서 구성)
}

/**
 * 좋아요
 */
export interface BoardLike {
  id: string;
  post_id?: string | null;
  comment_id?: string | null;
  user_id: string;
  created_at: string;
}

/**
 * 신고
 */
export interface BoardReport {
  id: string;
  post_id?: string | null;
  comment_id?: string | null;
  reported_by: string;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
}

/**
 * 게시글 목록 응답
 */
export interface PostListResponse {
  posts: BoardPost[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * 댓글 작성 요청
 */
export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}

/**
 * 게시글 작성 요청
 */
export interface CreatePostRequest {
  title: string;
  content: string;
  sharedReadingId?: string;
}
