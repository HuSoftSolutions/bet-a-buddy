// Type definitions for Google Maps JavaScript API
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getZoom(): number;
      getDiv(): Element;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): LatLngLiteral;
      equals(other: LatLng): boolean;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      contains(latLng: LatLng | LatLngLiteral): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      setLabel(label: string | MarkerLabel): void;
      setIcon(icon: string | Icon | Symbol): void;
      getPosition(): LatLng | null;
      getTitle(): string;
      getLabel(): MarkerLabel;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, anchor?: MVCObject): void;
      close(): void;
      setContent(content: string | Element): void;
      setPosition(position: LatLng | LatLngLiteral): void;
      setZIndex(zIndex: number): void;
      getContent(): string | Element;
      getPosition(): LatLng;
      getZIndex(): number;
    }

    class MVCObject {
      addListener(eventName: string, handler: Function): MapsEventListener;
      bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
      get(key: string): any;
      notify(key: string): void;
      set(key: string, value: any): void;
      setValues(values: any): void;
      unbind(key: string): void;
      unbindAll(): void;
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace places {
      class Autocomplete extends MVCObject {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        getBounds(): LatLngBounds;
        getPlace(): PlaceResult;
        setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
        setComponentRestrictions(restrictions: ComponentRestrictions): void;
        setFields(fields: string[]): void;
        setOptions(options: AutocompleteOptions): void;
        setTypes(types: string[]): void;
      }

      interface AutocompleteOptions {
        bounds?: LatLngBounds | LatLngBoundsLiteral;
        componentRestrictions?: ComponentRestrictions;
        fields?: string[];
        placeIdOnly?: boolean;
        strictBounds?: boolean;
        types?: string[];
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        adr_address?: string;
        aspects?: PlaceAspectRating[];
        business_status?: string;
        formatted_address?: string;
        formatted_phone_number?: string;
        geometry?: PlaceGeometry;
        html_attributions?: string[];
        icon?: string;
        international_phone_number?: string;
        name?: string;
        opening_hours?: OpeningHours;
        photos?: PlacePhoto[];
        place_id?: string;
        plus_code?: PlusCode;
        price_level?: number;
        rating?: number;
        reviews?: PlaceReview[];
        types?: string[];
        url?: string;
        user_ratings_total?: number;
        utc_offset?: number;
        vicinity?: string;
        website?: string;
      }

      interface PlaceGeometry {
        location: LatLng;
        viewport: LatLngBounds;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }

      interface PlaceAspectRating {
        rating: number;
        type: string;
      }

      interface OpeningHours {
        open_now: boolean;
        periods: OpeningPeriod[];
        weekday_text: string[];
      }

      interface OpeningPeriod {
        open: OpeningHoursTime;
        close?: OpeningHoursTime;
      }

      interface OpeningHoursTime {
        day: number;
        hours: number;
        minutes: number;
        time: string;
      }

      interface PlacePhoto {
        height: number;
        html_attributions: string[];
        width: number;
        getUrl(opts: PhotoOptions): string;
      }

      interface PhotoOptions {
        maxHeight?: number;
        maxWidth?: number;
      }

      interface PlusCode {
        compound_code: string;
        global_code: string;
      }

      interface PlaceReview {
        author_name: string;
        author_url: string;
        language: string;
        profile_photo_url: string;
        rating: number;
        relative_time_description: string;
        text: string;
        time: number;
      }
    }

    namespace drawing {
      class DrawingManager extends MVCObject {
        constructor(options?: DrawingManagerOptions);
        getDrawingMode(): OverlayType;
        getMap(): Map;
        setDrawingMode(drawingMode: OverlayType | null): void;
        setMap(map: Map | null): void;
        setOptions(options: DrawingManagerOptions): void;
      }

      enum OverlayType {
        CIRCLE,
        MARKER,
        POLYGON,
        POLYLINE,
        RECTANGLE
      }

      interface DrawingManagerOptions {
        circleOptions?: CircleOptions;
        drawingControl?: boolean;
        drawingControlOptions?: DrawingControlOptions;
        drawingMode?: OverlayType | null;
        map?: Map;
        markerOptions?: MarkerOptions;
        polygonOptions?: PolygonOptions;
        polylineOptions?: PolylineOptions;
        rectangleOptions?: RectangleOptions;
      }

      interface DrawingControlOptions {
        drawingModes?: OverlayType[];
        position?: ControlPosition;
      }
    }

    enum ControlPosition {
      BOTTOM_CENTER,
      BOTTOM_LEFT,
      BOTTOM_RIGHT,
      LEFT_BOTTOM,
      LEFT_CENTER,
      LEFT_TOP,
      RIGHT_BOTTOM,
      RIGHT_CENTER,
      RIGHT_TOP,
      TOP_CENTER,
      TOP_LEFT,
      TOP_RIGHT
    }

    enum MapTypeId {
      HYBRID,
      ROADMAP,
      SATELLITE,
      TERRAIN
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }

    interface MapOptions {
      backgroundColor?: string;
      center?: LatLng | LatLngLiteral;
      clickableIcons?: boolean;
      controlSize?: number;
      disableDefaultUI?: boolean;
      disableDoubleClickZoom?: boolean;
      draggable?: boolean;
      draggableCursor?: string;
      draggingCursor?: string;
      fullscreenControl?: boolean;
      fullscreenControlOptions?: FullscreenControlOptions;
      gestureHandling?: string;
      heading?: number;
      keyboardShortcuts?: boolean;
      mapTypeControl?: boolean;
      mapTypeControlOptions?: MapTypeControlOptions;
      mapTypeId?: MapTypeId | string;
      maxZoom?: number;
      minZoom?: number;
      noClear?: boolean;
      panControl?: boolean;
      panControlOptions?: PanControlOptions;
      restriction?: MapRestriction;
      rotateControl?: boolean;
      rotateControlOptions?: RotateControlOptions;
      scaleControl?: boolean;
      scaleControlOptions?: ScaleControlOptions;
      scrollwheel?: boolean;
      streetView?: StreetViewPanorama;
      streetViewControl?: boolean;
      streetViewControlOptions?: StreetViewControlOptions;
      styles?: MapTypeStyle[];
      tilt?: number;
      zoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: ZoomControlOptions;
    }

    interface FullscreenControlOptions {
      position?: ControlPosition;
    }

    interface MapTypeControlOptions {
      mapTypeIds?: (MapTypeId | string)[];
      position?: ControlPosition;
      style?: MapTypeControlStyle;
    }

    enum MapTypeControlStyle {
      DEFAULT,
      DROPDOWN_MENU,
      HORIZONTAL_BAR
    }

    interface MapRestriction {
      latLngBounds: LatLngBounds | LatLngBoundsLiteral;
      strictBounds?: boolean;
    }

    interface PanControlOptions {
      position?: ControlPosition;
    }

    interface RotateControlOptions {
      position?: ControlPosition;
    }

    interface ScaleControlOptions {
      style?: ScaleControlStyle;
    }

    enum ScaleControlStyle {
      DEFAULT
    }

    interface StreetViewControlOptions {
      position?: ControlPosition;
    }

    interface ZoomControlOptions {
      position?: ControlPosition;
    }

    interface StreetViewPanorama {
      // Add properties as needed
    }

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers: MapTypeStyler[];
    }

    interface MapTypeStyler {
      [key: string]: string | number | boolean;
    }

    interface MarkerOptions {
      anchorPoint?: Point;
      animation?: Animation;
      clickable?: boolean;
      crossOnDrag?: boolean;
      cursor?: string;
      draggable?: boolean;
      icon?: string | Icon | Symbol;
      label?: string | MarkerLabel;
      map?: Map | StreetViewPanorama;
      opacity?: number;
      optimized?: boolean;
      position: LatLng | LatLngLiteral;
      shape?: MarkerShape;
      title?: string;
      visible?: boolean;
      zIndex?: number;
    }

    interface MarkerLabel {
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
      text: string;
    }

    interface Icon {
      anchor?: Point;
      labelOrigin?: Point;
      origin?: Point;
      scaledSize?: Size;
      size?: Size;
      url: string;
    }

    interface Symbol {
      anchor?: Point;
      fillColor?: string;
      fillOpacity?: number;
      path: SymbolPath | string;
      rotation?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    interface MarkerShape {
      coords: number[];
      type: string;
    }

    enum Animation {
      BOUNCE,
      DROP
    }

    interface InfoWindowOptions {
      ariaLabel?: string;
      content?: string | Element;
      disableAutoPan?: boolean;
      maxWidth?: number;
      minWidth?: number;
      pixelOffset?: Size;
      position?: LatLng | LatLngLiteral;
      zIndex?: number;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      radius?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokePosition?: StrokePosition;
      strokeWeight?: number;
      visible?: boolean;
      zIndex?: number;
    }

    enum StrokePosition {
      CENTER,
      INSIDE,
      OUTSIDE
    }

    interface PolygonOptions {
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      fillColor?: string;
      fillOpacity?: number;
      geodesic?: boolean;
      map?: Map;
      paths?: Array<LatLng | LatLngLiteral> | Array<Array<LatLng | LatLngLiteral>>;
      strokeColor?: string;
      strokeOpacity?: number;
      strokePosition?: StrokePosition;
      strokeWeight?: number;
      visible?: boolean;
      zIndex?: number;
    }

    interface PolylineOptions {
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      geodesic?: boolean;
      icons?: Array<IconSequence>;
      map?: Map;
      path?: Array<LatLng | LatLngLiteral>;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      visible?: boolean;
      zIndex?: number;
    }

    interface IconSequence {
      icon: Symbol;
      offset?: string;
      repeat?: string;
    }

    interface RectangleOptions {
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      strokeColor?: string;
      strokeOpacity?: number;
      strokePosition?: StrokePosition;
      strokeWeight?: number;
      visible?: boolean;
      zIndex?: number;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      height: number;
      width: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface Padding {
      bottom: number;
      left: number;
      right: number;
      top: number;
    }
  }
}