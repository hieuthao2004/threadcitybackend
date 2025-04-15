import React, { useState } from 'react';

type FeedType = 'suggested' | 'following';

interface FeedSelectorProps {
  selectedFeed: FeedType;
  onSelectFeed: (feed: FeedType) => void;
}

export function FeedSelector({ selectedFeed, onSelectFeed }: FeedSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectFeed = (feed: FeedType) => {
    onSelectFeed(feed);
    setIsDropdownOpen(false);
  };

  return (
    <div className="feed-selector">
      <div className="feed-selector-header" onClick={handleToggleDropdown}>
        <span className="feed-selector-title">
          {selectedFeed === 'suggested' ? 'Dành cho bạn' : 'Following'}
        </span>
        <svg className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
        </svg>
      </div>
      
      {isDropdownOpen && (
        <div className="feed-selector-dropdown">
          <button 
            className={`feed-option ${selectedFeed === 'suggested' ? 'active' : ''}`} 
            onClick={() => handleSelectFeed('suggested')}
          >
            Dành cho bạn
          </button>
          <button 
            className={`feed-option ${selectedFeed === 'following' ? 'active' : ''}`} 
            onClick={() => handleSelectFeed('following')}
          >
            Following
          </button>
        </div>
      )}
    </div>
  );
}