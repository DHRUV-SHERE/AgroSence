import type { ReactNode } from "react";
import { Layout as RALayout, CheckForApplicationUpdate } from "react-admin";
import { AppBar } from "./AppBar";
import { Menu } from "./Menu";

export const Layout = ({ children }: { children: ReactNode }) => (
  <RALayout appBar={AppBar} menu={Menu}>
    {children}
    <CheckForApplicationUpdate />
  </RALayout>
);
