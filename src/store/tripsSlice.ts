import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TripDTO, DelayDTO, ApiResponse } from "@/types";

interface TripsState {
  items: TripDTO[];
  selected: TripDTO | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TripsState = {
  items: [],
  selected: null,
  status: "idle",
  error: null
};

export const fetchTrips = createAsyncThunk(
  "trips/fetchAll",
  async (params: { routeId?: string } | undefined, { rejectWithValue }) => {
    const query = params?.routeId ? `?routeId=${encodeURIComponent(params.routeId)}` : "";
    const res = await fetch(`/api/v1/trips${query}`);
    const json: ApiResponse<TripDTO[]> = await res.json();
    if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to load trips");
    return json.data as TripDTO[];
  }
);

export const fetchTripById = createAsyncThunk("trips/fetchOne", async (id: string, { rejectWithValue }) => {
  const res = await fetch(`/api/v1/trips/${id}`);
  const json: ApiResponse<TripDTO> = await res.json();
  if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to load trip");
  return json.data as TripDTO;
});

export const createTrip = createAsyncThunk("trips/create", async (payload: Partial<TripDTO>, { rejectWithValue }) => {
  const res = await fetch("/api/v1/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json: ApiResponse<TripDTO> = await res.json();
  if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to create trip");
  return json.data as TripDTO;
});

export const updateTrip = createAsyncThunk(
  "trips/update",
  async ({ id, payload }: { id: string; payload: Partial<TripDTO> }, { rejectWithValue }) => {
    const res = await fetch(`/api/v1/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json: ApiResponse<TripDTO> = await res.json();
    if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to update trip");
    return json.data as TripDTO;
  }
);

export const reportDelay = createAsyncThunk(
  "trips/reportDelay",
  async ({ tripId, delayMinutes, reason }: { tripId: string; delayMinutes: number; reason: string }, { rejectWithValue }) => {
    const res = await fetch(`/api/v1/trips/${tripId}/delay`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delayMinutes, reason })
    });
    const json: ApiResponse<TripDTO> = await res.json();
    if (!res.ok || json.error) return rejectWithValue(json.error || "Failed to update delay");
    return json.data as TripDTO;
  }
);

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load trips";
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(reportDelay.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      });
  }
});

export default tripsSlice.reducer;
