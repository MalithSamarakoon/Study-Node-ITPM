import '../../styles/qa/TagBadge.css';

function TagBadge({ tag, onClick }) {
  return (
    <span
      className="tag-badge"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {tag}
    </span>
  );
}

export default TagBadge;
