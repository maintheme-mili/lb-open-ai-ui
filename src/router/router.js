/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: 唐钰轩
 * @Date: 2023-02-11 09:22:56
 * @LastEditors: 唐钰轩
 * @LastEditTime: 2023-03-10 11:39:28
 */
import {lazy} from "react";

export const routerItems = [
    {
        path: "/",
        component: lazy(() => import("../views/App/App")),
        children: [
            {
                path: "/",
                component: lazy(() => import("../views/message/message")),
                meta: {
                    isLogin: true,
                },
            },
        ],
    },
    {
        path: "/login",
        component: lazy(() => import("../views/login/login")),
    },
    {
        path: "/click-flow",
        component: lazy(() => import("@/views/clickFlow/clickFlow")),
        meta: {
            breadcrumb: [
                {
                    title: "首页",
                    url: "/",
                },
            ],
        },
    },
    {
        path: "/prompts",
        component: lazy(() => import("@/views/prompts")),
        // meta: {
        //   breadcrumb: [
        //     {
        //       title: "首页",
        //       url: "/",
        //     },
        //   ],
        // },
    },
    {
        path: "/click-flow/workflow",
        component: lazy(() => import("@/views/clickFlow/workflow/workflow")),
        meta: {
            breadcrumb: [
                {
                    title: "首页",
                    url: "/",
                },
                {
                    title: "逐步运行",
                    url: "/click-flow",
                },
            ],
        },
    },
    {
        path: "*",
        component: lazy(() => import("../views/error/pageNotdefined")),
    },
];
