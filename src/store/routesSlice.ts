import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RouteDTO, ApiResponse } from "@/types";

interface RoutesState {
  items: RouteDTO[];
  selected: RouteDTO | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  searchTerm: string;
}

const initialState: RoutesState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
  searchTerm: ""
};

export const fetchRoutes = createAsyncThunk("routes/fetchAll", async (searchTerm: string | undefined, { rejectWithValue }) => {
  const params = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : "";
  const res = await fetch(`/api/v1/routes${params}`);
  const json: ApiResponse<RouteDTO[]> = await res.json();
  if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to load routes");
  return json.data as RouteDTO[];
});

export const fetchRouteById = createAsyncThunk("routes/fetchOne", async (id: string, { rejectWithValue }) => {
  const res = await fetch(`/api/v1/routes/${id}`);
  const json: ApiResponse<RouteDTO> = await res.json();
  if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to load route");
  return json.data as RouteDTO;
});

export const createRoute = createAsyncThunk(
  "routes/create",
  async (payload: Partial<RouteDTO>, { rejectWithValue }) => {
    const res = await fetch("/api/v1/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json: ApiResponse<RouteDTO> = await res.json();
    if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to create route");
    return json.data as RouteDTO;
  }
);

export const updateRoute = createAsyncThunk(
  "routes/update",
  async ({ id, payload }: { id: string; payload: Partial<RouteDTO> }, { rejectWithValue }) => {
    const res = await fetch(`/api/v1/routes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json: ApiResponse<RouteDTO> = await res.json();
    if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to update route");
    return json.data as RouteDTO;
  }
);

export const deleteRoute = createAsyncThunk("routes/delete", async (id: string, { rejectWithValue }) => {
  const res = await fetch(`/api/v1/routes/${id}`, { method: "DELETE" });
  const json: ApiResponse<{ id: string }> = await res.json();
  if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to delete route");
  return id;
});

const routesSlice = createSlice({
  name: "routes",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load routes";
      })
      .addCase(fetchRouteById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  }
});

export const { setSearchTerm } = routesSlice.actions;
export default routesSlice.reducer;
