import { Loader } from "@mantine/core";

export const Loading = ({ className }: { className?: string }) => (
  <div className={"flex justify-center items-center h-full " + className}>
    <Loader variant="dots" />
  </div>
);
