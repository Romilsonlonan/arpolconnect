export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className="h-full w-full"
    >
      <path
        fill="currentColor"
        d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1-88,88Zm52-88a52,52,0,0,1-96.88-28.16,8,8,0,0,1,15.68,3.32A36,36,0,1,0,128,92a8,8,0,0,1-16,0,52,52,0,0,1,52-52Z"
      />
    </svg>
  );
}
