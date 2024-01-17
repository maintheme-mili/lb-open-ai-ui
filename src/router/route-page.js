import { Suspense, useEffect } from "react";
import { routerItems } from "./router";
// 引入
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import WithBreadcrumb from "../components/withBreadcrumb/withBreadcrumb";

const Redirect = ({ to }) => {
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
};

const PageView = () => {
  function rotuerViews(routerItems) {
    return routerItems.map((item, i) => {
      return (
        <Route
          key={i}
          path={item.path}
          element={
            <Suspense fallback={<div></div>}>
              <WithBreadcrumb {...item.meta}>
                <item.component {...item.meta} />
              </WithBreadcrumb>
            </Suspense>
          }
        >
          {/* 重定向路由 */}
          {item.redirect && (
            <Route path={item.path} element={<Redirect to={item.redirect} />} />
          )}
          {/* 子路由 */}
          {item.children && rotuerViews(item.children)}
        </Route>
      );
    });
  }

  return (
    <BrowserRouter>
      <Routes>{rotuerViews(routerItems)}</Routes>
    </BrowserRouter>
  );
};
export default PageView;
