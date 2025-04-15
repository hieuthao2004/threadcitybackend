import React, { useState } from 'react';
import { PostItem, PostProps } from '../components/PostItem';
import { FeedSelector } from '../components/FeedSelector';

export function Home() {
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<'suggested' | 'following'>('suggested');

  // Xử lý tạo bài đăng mới (chỉ UI, không có API)
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postContent.trim()) return;
    
    setSubmitting(true);
    // Giả lập thời gian xử lý
    setTimeout(() => {
      setPostContent('');
      setSubmitting(false);
      // Thêm logic hiển thị bài viết mới ở đây nếu cần
    }, 1000);
  };

  // Demo posts - dữ liệu mẫu cố định
  const demoPosts: PostProps[] = [
    {
      id: '1',
      author: {
        id: 'user1',
        username: 'tpthao',
      },
      content: 'Mọi người có thấy hiện nay có người giả làm nhân viên skincity, làm hàng nhái không? Lần đầu mua mỹ phẩm mà không biết đây có ok không?',
      timestamp: new Date('2023-07-06T12:00:00'),
      likes: 446,
      replies: 16,
    },
    {
      id: '2',
      author: {
        id: 'user2',
        username: 'emilyne11',
      },
      content: '8 tháng chung trị trym(:',
      timestamp: new Date('2023-07-05T14:30:00'),
      likes: 10,
      replies: 0,
      isLiked: true,
    },
    {
      id: '3',
      author: {
        id: 'user3',
        username: 'traw_myx',
      },
      content: 'Thói tiết Hà Nội làm tôi muốn phải điên',
      timestamp: new Date('2023-07-05T10:15:00'),
      likes: 51,
      replies: 9,
    },
    {
      id: '4',
      author: {
        id: 'user4',
        username: 'tuyncl',
      },
      content: 'Ở đồng 1 mình là muốn đánh xài nhóa con trai hmnhh...',
      timestamp: new Date('2023-07-05T11:15:00'),
      likes: 2,
      replies: 1,
    }
  ];

  return (
    <div className="home-container">
      {/* Create post form */}
      <div className="create-post">
        <div className="create-post-avatar-placeholder">
          U
        </div>
        <form className="create-post-input" onSubmit={handleCreatePost}>
          <textarea
            className="create-post-textarea"
            placeholder="Có gì mới?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <div className="create-post-actions">
            <div className="post-attachments">
              <button type="button" className="attachment-button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
                </svg>
              </button>
            </div>
            <button 
              type="submit" 
              className="post-submit-button"
              disabled={!postContent.trim() || submitting}
            >
              {submitting ? 'Đang đăng...' : 'Đăng'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed container with border and rounded corners */}
      <div className="feed-card">
        {/* Feed selector */}
        <FeedSelector 
          selectedFeed={selectedFeed} 
          onSelectFeed={setSelectedFeed}
        />

        {/* Posts feed */}
        <div className="post-feed">
          {demoPosts.map((post) => (
            <PostItem key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
