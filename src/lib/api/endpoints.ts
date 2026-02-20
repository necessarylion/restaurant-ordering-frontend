/**
 * API endpoint constants
 * Centralized endpoint definitions to avoid magic strings
 */

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/user",
  },

  restaurants: {
    list: "/restaurants",
    create: "/restaurants",
    get: (id: number) => `/restaurants/${id}`,
    update: (id: number) => `/restaurants/${id}`,
    delete: (id: number) => `/restaurants/${id}`,
  },

  members: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/members`,
    invite: (restaurantId: number) => `/restaurants/${restaurantId}/invitations`,
    remove: (restaurantId: number, memberId: number) =>
      `/restaurants/${restaurantId}/members/${memberId}`,
    updateRole: (restaurantId: number, memberId: number) =>
      `/restaurants/${restaurantId}/members/${memberId}/role`,
    acceptInvitation: (token: string) => `/invitations/${token}/accept`,
  },

  categories: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/categories`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/categories`,
    get: (restaurantId: number, categoryId: number) =>
      `/restaurants/${restaurantId}/categories/${categoryId}`,
    update: (restaurantId: number, categoryId: number) =>
      `/restaurants/${restaurantId}/categories/${categoryId}`,
    delete: (restaurantId: number, categoryId: number) =>
      `/restaurants/${restaurantId}/categories/${categoryId}`,
  },

  menuItems: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/menu-items`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/menu-items`,
    get: (restaurantId: number, itemId: number) =>
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
    update: (restaurantId: number, itemId: number) =>
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
    delete: (restaurantId: number, itemId: number) =>
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
  },

  zones: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/zones`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/zones`,
    get: (restaurantId: number, zoneId: number) =>
      `/restaurants/${restaurantId}/zones/${zoneId}`,
    update: (restaurantId: number, zoneId: number) =>
      `/restaurants/${restaurantId}/zones/${zoneId}`,
    delete: (restaurantId: number, zoneId: number) =>
      `/restaurants/${restaurantId}/zones/${zoneId}`,
  },

  tables: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/tables`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/tables`,
    get: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}`,
    update: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}`,
    delete: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}`,
    floorPlan: (restaurantId: number) =>
      `/restaurants/${restaurantId}/tables/floor-plan`,
    generateToken: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}/order-token`,
  },

  orders: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/orders`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/orders`,
    createGuest: (restaurantId: number) => `/restaurants/${restaurantId}/orders/guest`, // Guest order creation without auth
    get: (restaurantId: number, orderId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}`,
    update: (restaurantId: number, orderId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}`,
    delete: (restaurantId: number, orderId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}`,
  },

  payments: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/payments`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/payments`,
    delete: (restaurantId: number, paymentId: number) =>
      `/restaurants/${restaurantId}/payments/${paymentId}`,
  },
} as const;
