import type { ComponentType } from "react";
import Dashboard from "../pages/Dashboard";
import Monitoring from "../pages/Monitoring";
import Alerts from "../pages/Alerts_History";
import Devices from "../pages/Sensors_Devices";
import AIAnalysis from "../pages/AI_Analysis";
import StaffManagement from "../pages/Staff_Management";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import {
  ProfileLayout,
  PersonalInfoPage,
  SecurityPage,
  ManagedPondsPage,
  PreferencesPage,
} from "../pages/Profile";

export interface RouteConfig {
  path?: string;
  index?: boolean;
  element: ComponentType<any>;
  children?: RouteConfig[];
  allowedRoles?: string[];
}

export const routes: RouteConfig[] = [
  {
    path: "/login",
    element: Login,
  },
  {
    path: "/forgot-password",
    element: ForgotPassword,
  },
  {
    path: "/profile",
    element: ProfileLayout,
    children: [
      {
        index: true,
        element: PersonalInfoPage,
      },
      {
        path: "personal",
        element: PersonalInfoPage,
      },
      {
        path: "security",
        element: SecurityPage,
      },
      {
        path: "ponds",
        element: ManagedPondsPage,
      },
      {
        path: "preferences",
        element: PreferencesPage,
      },
      {
        path: "settings",
        element: PreferencesPage,
      },
    ],
  },
  {
    path: "/settings",
    element: ProfileLayout,
    children: [
      {
        index: true,
        element: PreferencesPage,
      },
    ],
  },
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
  {
    path: "/staff",
    element: StaffManagement,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
];