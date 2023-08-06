import React from 'react';
import PropTypes from 'prop-types';

function StyledBadge({ type, children }) {
  const badgeStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '9999px',
    color: 'white',
    fontWeight: 'bold',
  };

  let backgroundColor;

  switch (type.toLowerCase()) {
    case 'easy':
      backgroundColor = 'green';
      break;
    case 'medium':
      backgroundColor = 'orange';
      break;
    case 'hard':
      backgroundColor = 'red';
      break;
    default:
      backgroundColor = 'gray';
      break;
  }

  const badgeStyles = {
    ...badgeStyle,
    backgroundColor,
  };

  return <span style={badgeStyles}>{children}</span>;
}

StyledBadge.propTypes = {
  type: PropTypes.oneOf(['easy', 'medium', 'hard']),
  children: PropTypes.node.isRequired,
};

export default StyledBadge;
