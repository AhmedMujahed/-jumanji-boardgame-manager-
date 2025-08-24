'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
	children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
	const [mounted, setMounted] = useState(false);
	const [container, setContainer] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setMounted(true);
		setContainer(document.body);
		return () => setMounted(false);
	}, []);

	if (!mounted || !container) return null;
	return createPortal(children, container);
};

export default ModalPortal;


