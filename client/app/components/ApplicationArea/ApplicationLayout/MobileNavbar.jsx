import { first } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import MenuOutlinedIcon from "@ant-design/icons/MenuOutlined";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Link from "@/components/Link";
import { Auth, currentUser } from "@/services/auth";
import settingsMenu from "@/services/settingsMenu";
import logoUrl from "@/assets/images/icon_small.png";
import { useScrollHide } from "./useScrollHide";
import "./MobileNavbar.less";

export default function MobileNavbar({ getPopupContainer }) {
  const firstSettingsTab = first(settingsMenu.getAvailableItems());
  const isVisible = useScrollHide(".dialogue-content-all");

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className={`mobile-navbar`}>
      <div className="mobile-navbar-logo">
        <Link href="./">
          <img src={logoUrl} alt="DeepBI" onClick={handleLogoClick} />
        </Link>
      </div>
      <div className="mobile-navbar-name">ChatBI</div>
      <div>
        <Dropdown
          overlayStyle={{ minWidth: 200 }}
          trigger={["click"]}
          getPopupContainer={getPopupContainer}
          overlay={
            <Menu mode="vertical" theme="dark" selectable={false} className="mobile-navbar-menu">
              <Menu.Item key="testdialogue">
                <Link href="./">{window.W_L.data_analysis}</Link>
              </Menu.Item>
              <Menu.Item key="dialogue-list">
                <Link href="dialogue-list">{window.W_L.history_dialogue}</Link>
              </Menu.Item>
              <Menu.Item key="report-route" style={{ display: currentUser.isGuest() ? "none" : "block" }}>
                <Link href="report-route">{window.W_L.report_generation}</Link>
              </Menu.Item>
              <Menu.Item key="queries" style={{ display: currentUser.isGuest() ? "none" : "block" }}>
                <Link href="queries">{window.W_L.report_list}</Link>
              </Menu.Item>
              <Menu.Item key="dashboards" style={{ display: currentUser.isGuest() ? "none" : "block" }}>
                <Link href="dashboards">{window.W_L.dashboard}</Link>
              </Menu.Item>
              <Menu.Item key="dashboards_prettify" style={{ display: currentUser.isGuest() ? "none" : "block" }}>
                <Link href="dashboards_prettify">{window.W_L.dashboards_prettify}</Link>
              </Menu.Item>
              <Menu.Item key="autopilot" style={{ display: currentUser.isGuest() ? "none" : "block" }}>
                <Link href="autopilot">{window.W_L.auto_pilot}</Link>
              </Menu.Item>
              <Menu.Item key="autopilot_list" style={{ display: currentUser.isGuest() ? "none" : "block" }}>
                <Link href="autopilot_list">{window.W_L.history_autopilot}</Link>
              </Menu.Item>

              {firstSettingsTab && (
                <Menu.Item key="settings">
                  <Link href={firstSettingsTab.path}>{window.W_L.setting}</Link>
                </Menu.Item>
              )}
              {currentUser.hasPermission("super_admin") && <Menu.Divider />}
              <Menu.Item key="logout" onClick={() => Auth.logout()}>
                {window.W_L.log_out}
              </Menu.Item>
            </Menu>
          }>
          <Button className="mobile-navbar-toggle-button" ghost>
            <MenuOutlinedIcon />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

MobileNavbar.propTypes = {
  getPopupContainer: PropTypes.func,
};

MobileNavbar.defaultProps = {
  getPopupContainer: null,
};
