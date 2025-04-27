import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../services/postService';
import Button from '../common/Button';
import Input from '../common/Input';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await createPost({ title, content });
      if (response.success) {
        navigate('/'); // Redirect to home or post list after successful creation
      } else {
        setMessage(response.message || 'Failed to create post');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      {message && <div className="alert">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <Input
            as="textarea"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </div>
  );
}

export default CreatePost;