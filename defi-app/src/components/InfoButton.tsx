interface InfoButtonProps {
  onClick: () => void;
}

export function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-slate-500 hover:text-blue-400 text-xs cursor-pointer ml-1 leading-none"
      aria-label="More information"
    >
      &#9432;
    </button>
  );
}
