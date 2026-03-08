import {
    type RouteConfig,
    index,
    route,
    prefix,
    layout,
} from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("auth/login", "routes/auth.login.tsx"),
    route("auth/register", "routes/auth.register.tsx"),
    route("auth/logout", "routes/auth.logout.tsx"),
    route("track/:hash", "routes/track.$hash.tsx"),
    ...prefix("dashboard", [
        layout("routes/dashboard.tsx", [
            index("routes/dashboard._index.tsx"),
            route("users", "routes/dashboard.users.tsx"),
            route("products", "routes/dashboard.products.tsx"),
            route("products/:id", "routes/dashboard.products.$id.tsx"),
            route("planning", "routes/dashboard.planning.tsx"),
            route("acompanhamento", "routes/dashboard.acompanhamento.tsx"),
            route("hubs", "routes/dashboard.hubs.tsx"),
            route("scan", "routes/dashboard.scan.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
