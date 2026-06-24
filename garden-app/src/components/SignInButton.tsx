import { useEffect, useRef } from "react";

interface SignInButtonProps {
	renderSignInButton: (container: HTMLElement) => void;
}

export function SignInButton({ renderSignInButton }: SignInButtonProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) renderSignInButton(containerRef.current);
	}, [renderSignInButton]);

	return <div ref={containerRef} />;
}
