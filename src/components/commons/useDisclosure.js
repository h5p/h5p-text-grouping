import React from 'react';

/**
 * Encapsulates manipulation of a boolean.
 * Can be used for opening and closing menu items.
 * Use object destructuring to select the callback functions needed.
 * @see https://blogg.bekk.no/kaptein-krok-%EF%B8%8F-usedisclosure-5654962b3ad2
 * @param {boolean} defaultOpen Wether the starting state is open or not
 * @returns {object} {isOpen, onOpen, onClose, onToggle}
 */
export function useDisclosure(defaultOpen = false) {
  const [isOpen, setOpen] = React.useState(defaultOpen);
  const onOpen = React.useCallback(() => setOpen(true), []);
  const onClose = React.useCallback(() => setOpen(false), []);
  const onToggle = React.useCallback(() => setOpen((prev) => !prev), []);
  return { isOpen, onOpen, onClose, onToggle };
}
