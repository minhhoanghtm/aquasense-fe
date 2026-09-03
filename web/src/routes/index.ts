import type { ComponentType } from "react";
import Dashboard from "../pages/Dashboard";
import Monitoring from "../pages/Monitoring";
import Alerts from "../pages/Alerts_History";
import Devices from "../pages/Sensors_Devices";
import AIAnalysis from "../pages/AI_Analysis";

export interface RouteConfig {
    path: string;
    element: ComponentType<any>;
}

export const routes: RouteConfig[] = [
    {
        path: "/dashboard",
        element: Dashboard,
    },
    {
        path: "/monitoring",
        element: Monitoring,
    },
    {
        path: "/alerts",
        element: Alerts,
    },
    {
        path: "/devices",
        element: Devices,
    },
    {
        path: "/ai-analysis",
        element: AIAnalysis,
    },
];