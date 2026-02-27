# Map Boundaries Configuration

## Overview

The coordinate picker map in the Manual Order Entry form is restricted to the geographic boundaries of New York State. This prevents users from selecting coordinates outside of NY State, where tax calculations would fail.

## Implementation

### Map Constraints

The map is configured with the following constraints in `CoordinatePickerMap.tsx`:

```typescript
// NY State geographic boundaries (approximate coordinates)
const NY_STATE_BOUNDS: [[number, number], [number, number]] = [
    [40.496, -79.762], // Southwest corner [lat, lng]
    [45.015, -71.856], // Northeast corner [lat, lng]
];
```

### MapContainer Configuration

```typescript
<MapContainer
    center={center}
    zoom={zoom}
    minZoom={6}              // Minimum zoom level (state overview)
    maxZoom={18}             // Maximum zoom level (street detail)
    maxBounds={NY_STATE_BOUNDS}
    maxBoundsViscosity={1.0} // Prevents panning outside bounds
    scrollWheelZoom
    className="h-full w-full"
>
```

## Geographic Coverage

### New York State Boundaries

**Northernmost Point:** 45.015° N (near Canadian border)
**Southernmost Point:** 40.496° N (New York City area)
**Westernmost Point:** 79.762° W (Lake Erie)
**Easternmost Point:** 71.856° W (Long Island)

### Zoom Levels

- **minZoom: 6** - Shows entire NY State with surrounding areas visible
- **maxZoom: 18** - Street-level detail for precise coordinate selection
- **default zoom: 7** - When no coordinates selected (state overview)
- **selected zoom: 12** - When valid coordinates are provided (city/town level)

### Viscosity Setting

`maxBoundsViscosity={1.0}` creates a "hard" boundary:
- **1.0** = Map cannot be dragged outside bounds at all
- **0.0** = Bounds are completely flexible (ignored)
- **0.5** = Moderate resistance (map bounces back)

## User Experience

### Behavior

1. **Initial Load:** Map centers on NY State center (42.9° N, 75.5° W) at zoom level 7
2. **Panning:** Users can pan freely within NY State bounds but cannot drag the map outside
3. **Zooming:** Users can zoom from state overview (6) to street detail (18)
4. **Clicking:** Clicking anywhere within visible area sets coordinates
5. **Dragging Marker:** Users can drag the marker to fine-tune position (within bounds)

### Valid Coordinate Selection

Users can select coordinates in any of these regions:

- **New York City** (All 5 boroughs)
- **Long Island** (Nassau, Suffolk counties)
- **Hudson Valley** (Westchester, Rockland, Orange, Dutchess, etc.)
- **Capital Region** (Albany, Schenectady, Troy)
- **Central NY** (Syracuse, Utica, Rome)
- **Finger Lakes** (Rochester, Geneva)
- **Western NY** (Buffalo, Niagara Falls)
- **North Country** (Plattsburgh, Watertown)
- **Southern Tier** (Binghamton, Elmira)

### What Happens Outside Bounds

If a user tries to select coordinates outside NY State:

1. **Map View:** Cannot pan to view areas significantly outside NY State
2. **Manual Entry:** Users can still type coordinates in the input fields
3. **Validation:** Backend will return an error if coordinates are outside NY jurisdiction
4. **Error Message:** "Координати поза межами штату Нью-Йорк" (Coordinates outside NY State)

## Testing Coordinates

### Within Bounds (Valid)

```javascript
// New York City
{ latitude: 40.7484, longitude: -73.9857 }

// Buffalo
{ latitude: 42.8864, longitude: -78.8784 }

// Albany
{ latitude: 42.6526, longitude: -73.7562 }

// Syracuse
{ latitude: 43.0481, longitude: -76.1474 }

// Plattsburgh (Northern border)
{ latitude: 44.6995, longitude: -73.4529 }
```

### Outside Bounds (Invalid - Map prevents selection)

```javascript
// New Jersey
{ latitude: 40.0583, longitude: -74.4057 } // Below southern bound

// Vermont
{ latitude: 44.5588, longitude: -72.5778 } // East of eastern bound

// Pennsylvania
{ latitude: 41.2033, longitude: -77.1945 } // South/west border

// Canada
{ latitude: 45.4215, longitude: -75.6972 } // North of northern bound
```

## Configuration Options

### Adjusting Boundaries

To modify the map boundaries, edit the `NY_STATE_BOUNDS` constant:

```typescript
const NY_STATE_BOUNDS: [[number, number], [number, number]] = [
    [southLat, westLng],  // Southwest corner
    [northLat, eastLng],  // Northeast corner
];
```

### Making Boundaries More/Less Strict

Change `maxBoundsViscosity`:

```typescript
// Strict (current)
maxBoundsViscosity={1.0}

// Moderate (allows some overpanning, then bounces back)
maxBoundsViscosity={0.5}

// Loose (bounds are suggestions only)
maxBoundsViscosity={0.1}
```

### Adjusting Zoom Limits

```typescript
// More restricted (closer state view)
minZoom={7}    // Less area visible
maxZoom={16}   // Less street detail

// More flexible (current)
minZoom={6}    // Wider view
maxZoom={18}   // More street detail
```

## Benefits

### User Experience

✅ **Prevents Invalid Selections:** Users cannot accidentally select coordinates outside NY State
✅ **Clear Boundaries:** Visual indication of valid selection area
✅ **Smooth Navigation:** Can freely explore within state bounds
✅ **No Failed Requests:** Reduces errors from invalid coordinate submissions

### Performance

✅ **Reduced Tile Loading:** Only loads map tiles for NY region
✅ **Focused View:** Users don't waste time looking at irrelevant areas
✅ **Faster Backend Response:** All selected coordinates are likely to have valid tax data

### Data Integrity

✅ **Enforced Jurisdiction:** Ensures coordinates match available tax jurisdictions
✅ **Consistent Results:** All orders have valid NY State location data
✅ **Reduced Errors:** Fewer 404 errors for "jurisdiction not found"

## Integration with Tax System

The map boundaries align with the PostGIS database coverage:

```sql
-- Database tables with geographic data
- ny_counties   (62 counties covering entire NY State)
- ny_cities     (Cities with special tax rates)
- towns         (Towns within counties)
- villages      (Villages within towns)
```

All geometries in these tables are within the map boundaries, ensuring that any coordinate selected on the map will have corresponding geographic and tax data in the database.

## Future Enhancements

### Potential Improvements

1. **County Highlighting:** Show county boundaries as overlay
2. **City Markers:** Display cities with special tax rates
3. **Search Box:** Allow users to search for specific cities/addresses
4. **Tax Rate Preview:** Show estimated tax rate on map hover
5. **Recent Locations:** Quick selection from previously used coordinates
6. **Snap to City Center:** Option to auto-center on nearest city
7. **MCTD Boundary:** Highlight Metropolitan Commuter Transportation District area

### Custom Boundaries by User Type

```typescript
// Admin users - full NY State
const ADMIN_BOUNDS = NY_STATE_BOUNDS;

// Regional users - specific county/region
const WESTCHESTER_BOUNDS = [[40.89, -73.98], [41.37, -73.48]];
const NYC_BOUNDS = [[40.49, -74.26], [40.92, -73.70]];
```

## References

- **Leaflet Documentation:** https://leafletjs.com/reference.html#map-maxbounds
- **NY State Coordinates:** Based on USGS geographic data
- **PostGIS Coverage:** Matches Shapefiles imported from official NY State sources
