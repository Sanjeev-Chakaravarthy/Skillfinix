import { NavLink as RouterNavLink } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const NavLink = forwardRef((props, ref) => {
  const {
    className,
    activeClassName,
    pendingClassName,
    to,
    ...rest
  } = props;

  return (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive, isPending }) =>
        cn(
          className,
          isActive && activeClassName,
          isPending && pendingClassName
        )
      }
      {...rest}
    />
  );
});

NavLink.displayName = "NavLink";

export { NavLink };
