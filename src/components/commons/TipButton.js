import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import './TipButton.scss';

/**
 * Tooltip tag displayed over a child element
 * @param {object} props Props object
 * @returns {JSX.Element} A single tool tip tag element
 */
const TipButton = ({
  escapeOverflow = false,
  className = '',
  children,
  tip,
  guard = false,
  forceShowTip = false,
  alignment = 'center'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const tipWrapperRef = useRef(null);
  const isTouchEvent = useRef(false);

  let position;
  if (escapeOverflow && tipWrapperRef.current) {
    const tipPos = tipWrapperRef.current.getBoundingClientRect();
    const topPos = tipWrapperRef.current.offsetTop + tipPos.height / 2;

    // Add scroll offset
    const parentScroll = tipWrapperRef.current.parentNode.scrollTop;
    position = { top: topPos - parentScroll };
  }

  className += ` h5p-react-tip-button ${alignment}`;
  if (position) {
    className += ' positioned';
  }

  return (
    <div
      className={className}
      onMouseOver={() => {
        if (!isTouchEvent || !isTouchEvent.current) {
          setIsHovered(true);
        }
        isTouchEvent.current = false;
      }}
      onMouseLeave={() => {
        if (!isTouchEvent || !isTouchEvent.current) {
          setIsHovered(false);
        }
      }}
      onTouchStart={() => {
        setIsHovered(true);
        isTouchEvent.current = true;
      }}
      onTouchEnd={setIsHovered.bind(this, false)}
      onTouchCancel={setIsHovered.bind(this, false)}
      ref={tipWrapperRef}
    >
      {children}
      {!tip ? null : (
        <CSSTransition
          in={(forceShowTip || isHovered) && !guard}
          timeout={200}
          classNames="tip-wrapper"
        >
          <div className={`tip-wrapper ${alignment}`} style={position ? position : {}}>
            <div className="tip" dangerouslySetInnerHTML={{ __html: tip }} />
            <div className="arrow" />
          </div>
        </CSSTransition>
      )}
    </div>
  );
};

TipButton.propTypes = {
  escapeOverflow: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  tip: PropTypes.string.isRequired,
  guard: PropTypes.bool,
  forceShowTip: PropTypes.bool,
  alignment: PropTypes.string
};

export default TipButton;
