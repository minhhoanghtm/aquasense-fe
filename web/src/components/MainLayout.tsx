import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const MainLayout = memo(function MainLayout() {
  return (
    <>
      <Header />
      <div className="flex-1 w-full flex flex-col">
        <Outlet />
      </div>
    </>
  );
});

export default MainLayout;
