import {
  Alert,
  Box,
  Collapse,
  Container,
  Divider,
  IconButton,
  List,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AppBar,
  Drawer,
  DrawerHeader,
  keys,
  laravelDecrypt,
} from "../../constants/config";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getData, removeAllData } from "../../helpers/localstorage";
import { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import CssBaseline from "@mui/material/CssBaseline";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import { PermissionGate } from "../../helpers/PermissionGate";
import { items } from "./defaultPaths";
import { paths } from "../../constants/paths";
import { useAuthWatcher } from "../../hooks/useAuthWatcher";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";

export const getAllowedPaths = (items, role) => {
  const paths = [];

  items.forEach((item) => {
    if (item.url && (!item.roles || item.roles.includes(role))) {
      paths.push(item.url);
    }
    if (item.children?.length > 0) {
      item.children.forEach((child) => {
        if (child.url && (!child.roles || child.roles.includes(role))) {
          paths.push(child.url);
        }
      });
    }
  });

  return paths;
};

export const DefaultLayout = () => {
  const userRole = useSelector((state) => state.share.role);

  useAuthWatcher();

  // const audioRef = useRef(null);
  // audioRef.current = new Audio(wavFile);
  // audioRef.current.loop = true;

  const location = useLocation();

  const theme = useTheme();
  // const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const profileOpen = Boolean(anchorEl);

  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [storeData, setStoreData] = useState({});
  const [token, setToken] = useState("");
  const [openAlert, setOpenAlert] = useState(false);

  const visibleItems = items.filter(
    (nav) => !nav.roles || nav.roles.includes(storeData?.role)
  );

  const handleClickOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toogleExpand = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();

  const logout = async () => {
    removeAllData();
    navigate(paths.adminLogout);
  };

  const formattedTime = time.toLocaleTimeString();

  useEffect(() => {
    const init = async () => {
      if (Object.keys(storeData).length === 0) {
        const decrypted = await laravelDecrypt(getData(keys.CODE));
        if (!decrypted) {
          setOpenAlert(true);
          logout();
        } else {
          setStoreData(decrypted);
          setToken(decrypted?.token);
        }
      }
    };
    init();
  }, []);

  let displayName = "";
  switch (storeData.role) {
    case "AGENT":
      displayName = `${storeData?.user?.name} ${
        storeData?.user?.counter &&
        " - (" + storeData?.user?.counter + " Agent)"
      }`;
      break;
    case "SUPER_ADMIN":
      displayName = `${storeData?.user?.name} (Super Admin)`;
      break;

    case "SALES":
      displayName = `${storeData?.user?.name} (${
        storeData?.user?.counter ? storeData?.user?.counter : ""
      } ${storeData?.role})`;
      break;
    default:
      displayName = "";
      break;
  }

  const drawerWidth = 240;
  const closedWidth = 60;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          // width: "100vw",
          // maxWidth: "100vw",
          // overflowX: "hidden",
        }}
      >
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={open ? handleDrawerClose : handleDrawerOpen}
              edge="start"
              sx={{ mr: 2 }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>

            <Typography variant="h6" sx={{ display: "inline" }}>
              {displayName}
            </Typography>

            <Menu
              id="account-menu"
              open={profileOpen}
              anchorEl={anchorEl}
              onClose={handleClose}
            ></Menu>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <Container>Shwe Yoke Lay Express</Container>
          </DrawerHeader>
          <Divider />
          <List sx={{ overflow: "scroll", overflowX: "hidden" }}>
            {visibleItems.map((nav, index) => {
              // Check if current path matches nav or children
              const isChildActive = nav.children?.some(
                // (child) => location.pathname === child.url
                (child) => location.pathname.startsWith(child.url) // allow detail pages
              );
              const isActive = location.pathname === nav.url || isChildActive;

              return (
                <div key={index}>
                  <PermissionGate permission={nav.permission} roles={nav.roles}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => {
                        toogleExpand(index);
                        if (nav.url) {
                          navigate(nav.url);
                        }
                      }}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "#1976d2", // blue background
                          color: "white", // text color
                          "& .MuiListItemIcon-root": {
                            color: "white", // icon color
                          },
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "#1565c0", // darker on hover
                        },
                      }}
                    >
                      <ListItemIcon>{nav.icon}</ListItemIcon>
                      <ListItemText primary={nav.label} />
                      {nav?.children?.length > 0 &&
                        (expandedIndex === index ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        ))}
                    </ListItemButton>

                    {nav?.children?.length > 0 && (
                      <Collapse
                        in={expandedIndex === index}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {/* Permission Gate Add SoeWanna */}
                          {nav.children
                            ?.filter(
                              (child) =>
                                !child.roles ||
                                child.roles.includes(storeData.role)
                            )
                            .map((child) => {
                              return (
                                <PermissionGate
                                  key={child.key}
                                  permission={child.permission}
                                >
                                  <ListItemButton
                                    onClick={() => navigate(child.url)}
                                    sx={{ pl: 4 }}
                                  >
                                    <ListItemIcon>{child.icon}</ListItemIcon>
                                    <ListItemText primary={child.label} />
                                  </ListItemButton>
                                </PermissionGate>
                              );
                            })}
                        </List>
                      </Collapse>
                    )}
                  </PermissionGate>
                </div>
              );
            })}
          </List>
          <Divider />
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Outlet />
        </Box>
      </Box>
      <Snackbar
        open={openAlert}
        // autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error">Encrypt Key is wrong!</Alert>
      </Snackbar>
    </>
  );
};

{
  /* <>
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={open ? handleDrawerClose : handleDrawerOpen}
              edge="start"
              sx={{ mr: 2 }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>

            <Typography variant="h6" sx={{ display: "inline" }}>
              {displayName}
            </Typography>

            <Menu
              id="account-menu"
              open={profileOpen}
              anchorEl={anchorEl}
              onClose={handleClose}
            ></Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : closedWidth,
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "width 0.3s",
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : closedWidth,
              overflowX: "hidden",
              transition: "width 0.3s",
              boxSizing: "border-box",
            },
          }}
        >
          <DrawerHeader>
            <Container>Shwe Yoke Lay Express</Container>
          </DrawerHeader>
          <Divider />
          <List sx={{ overflow: "scroll", overflowX: "hidden" }}>
            {visibleItems.map((nav, index) => {
              // Check if current path matches nav or children
              const isChildActive = nav.children?.some(
                // (child) => location.pathname === child.url
                (child) => location.pathname.startsWith(child.url) // allow detail pages
              );
              const isActive = location.pathname === nav.url || isChildActive;

              return (
                <div key={index}>
                  <PermissionGate permission={nav.permission} roles={nav.roles}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => {
                        toogleExpand(index);
                        if (nav.url) {
                          navigate(nav.url);
                        }
                      }}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "#1976d2", // blue background
                          color: "white", // text color
                          "& .MuiListItemIcon-root": {
                            color: "white", // icon color
                          },
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "#1565c0", // darker on hover
                        },
                      }}
                    >
                      <ListItemIcon>{nav.icon}</ListItemIcon>
                      <ListItemText primary={nav.label} />
                      {nav?.children?.length > 0 &&
                        (expandedIndex === index ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        ))}
                    </ListItemButton>

                    {nav?.children?.length > 0 && (
                      <Collapse
                        in={expandedIndex === index}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {nav.children
                            ?.filter(
                              (child) =>
                                !child.roles ||
                                child.roles.includes(storeData.role)
                            )
                            .map((child) => {
                              return (
                                <PermissionGate
                                  key={child.key}
                                  permission={child.permission}
                                >
                                  <ListItemButton
                                    onClick={() => navigate(child.url)}
                                    sx={{ pl: 4 }}
                                  >
                                    <ListItemIcon>{child.icon}</ListItemIcon>
                                    <ListItemText primary={child.label} />
                                  </ListItemButton>
                                </PermissionGate>
                              );
                            })}
                        </List>
                      </Collapse>
                    )}
                  </PermissionGate>
                </div>
              );
            })}
          </List>
          <Divider />
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: open ? `calc(100vw - ${drawerWidth}px)` : "100vw",
            maxWidth: open ? `calc(100vw - ${drawerWidth}px)` : "100vw",
            transition: "width 0.3s",
            p: 3,
            overflowX: "hidden",
          }}
        >
          <DrawerHeader />
          <Outlet />
        </Box>
      </Box>
      <Snackbar
        open={openAlert}
        // autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error">Encrypt Key is wrong!</Alert>
      </Snackbar>
    </> */
}
