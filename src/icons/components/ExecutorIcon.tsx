import { IconProps } from '../IconProps';

const ExecutorIcon = (props: IconProps & { type?: string }) => (
  <svg viewBox="0 0 24 24" fill={props.color} className={props.className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.5 4C2.22386 4 2 4.22386 2 4.5V7.5C2 7.77614 2.22386 8 2.5 8H21.5C21.7761 8 22 7.77614 22 7.5V4.5C22 4.22386 21.7761 4 21.5 4H2.5ZM7 5H5V7H7V5ZM2.5 10C2.22386 10 2 10.2239 2 10.5V13.5C2 13.7761 2.22386 14 2.5 14H21.5C21.7761 14 22 13.7761 22 13.5V10.5C22 10.2239 21.7761 10 21.5 10H2.5ZM7 11H5V13H7V11ZM2 16.5C2 16.2239 2.22386 16 2.5 16H21.5C21.7761 16 22 16.2239 22 16.5V19.5C22 19.7761 21.7761 20 21.5 20H2.5C2.22386 20 2 19.7761 2 19.5V16.5ZM5 17H7V19H5V17Z"
    />
    #404040
  </svg>
);

export default ExecutorIcon;
