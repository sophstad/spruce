import { useState } from "react";
import styled from "@emotion/styled";
import Icon from "@leafygreen-ui/icon";
import { Menu, MenuItem } from "@leafygreen-ui/menu";
import { palette } from "@leafygreen-ui/palette";
import { Link } from "react-router-dom";
import { zIndex } from "constants/tokens";

const { white } = palette;

const DropdownMenuIcon: React.VFC<{ open: boolean }> = ({ open }) => (
  <Icon glyph={open ? "CaretUp" : "CaretDown"} role="presentation" />
);

// Use a wrapper over React Router's Link so that native HTML props can be passed through LeafyGreen MenuItem.
// (i.e. convert "data-to" to "to")

interface LinkWrapperType
  extends Omit<React.ComponentProps<typeof Link>, "to"> {
  "data-to": string;
}

export const LinkWrapper: React.FC<LinkWrapperType> = ({
  "data-to": dataTo,
  children,
  ...rest
}) => (
  <Link to={dataTo} {...rest}>
    {children}
  </Link>
);

interface MenuItemType {
  "data-cy"?: string;
  text: string;
  href?: string;
  to?: string;
  onClick?: () => void;
}

interface DropdownItemType extends MenuItemType {
  closeMenu: () => void;
}

const DropdownItem: React.VFC<DropdownItemType> = ({
  "data-cy": itemDataCy,
  closeMenu,
  href,
  text,
  to,
}) => (
  <MenuItem
    as={to && LinkWrapper}
    data-to={to}
    href={href}
    data-cy={itemDataCy}
    onClick={closeMenu}
  >
    {text}
  </MenuItem>
);

interface DropdownProps {
  dataCy?: string;
  menuItems: MenuItemType[];
  title: string;
}

export const Dropdown: React.VFC<DropdownProps> = ({
  dataCy,
  menuItems,
  title,
}) => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <Menu
      open={openMenu}
      setOpen={setOpenMenu}
      popoverZIndex={zIndex.popover}
      justify="start"
      trigger={
        <NavDropdownTitle data-cy={dataCy}>
          {title}
          <DropdownMenuIcon open={openMenu} />
        </NavDropdownTitle>
      }
    >
      {menuItems.map((menuItem) => (
        <DropdownItem
          key={`dropdown_${menuItem.text}`}
          closeMenu={() => {
            menuItem.onClick?.(); // call if exists
            setOpenMenu(false);
          }}
          {...menuItem}
        />
      ))}
    </Menu>
  );
};

const NavDropdownTitle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${white};
  cursor: pointer;
`;
