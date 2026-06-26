/**
 * Format a timestamp or date string into a readable relative time (e.g. "2h ago", "Just now")
 * @param {string|Date|object} dateInput 
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  
  let date;
  if (dateInput.toDate && typeof dateInput.toDate === 'function') {
    // Firestore Timestamp
    date = dateInput.toDate();
  } else {
    date = new Date(dateInput);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Extract initials from a full name (e.g. "John Doe" -> "JD")
 * @param {string} name 
 */
export const getInitials = (name) => {
  if (!name) return 'SC';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
