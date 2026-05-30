import type { ReactNode } from "react";
import type { TabName } from "./types";

export function Tabs(props: { activeTab: TabName; children: Partial<Record<TabName, ReactNode>> }) {
  return <>{props.children[props.activeTab] ?? null}</>;
}

