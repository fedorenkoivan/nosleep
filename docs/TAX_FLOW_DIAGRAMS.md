# Tax Calculation Flow Diagrams

## 1. Complete System Flow

```mermaid
sequenceDiagram
    participant User as User/Frontend
    participant API as Express API
    participant Service as OrderService
    participant DB as PostgreSQL/PostGIS
    participant TaxTables as Tax Tables

    User->>API: POST /calculate-tax<br/>{subtotal, longitude, latitude}
    
    Note over API: Validate input<br/>(required fields, numeric values)
    
    API->>Service: calculateTax(amount, lng, lat)
    
    Note over Service: Step 1: Find Jurisdiction
    Service->>DB: Execute PostGIS Query<br/>ST_Contains with Point
    
    Note over DB: Query ny_cities<br/>and ny_counties tables
    DB-->>Service: [{name: "New York", level: "city"},<br/>{name: "New York", level: "county"}]
    
    Note over Service: Step 2: Determine Priority<br/>(City → County)
    
    Service->>TaxTables: Query city_tax or county_tax<br/>WHERE name LIKE 'New York'
    TaxTables-->>Service: {tax: 8.875, special_rate: 0.375}
    
    Note over Service: Step 3: Calculate Taxes
    Note over Service: state_tax = amount × 0.04<br/>local_tax = amount × (rate - 0.04)<br/>special_tax = amount × special_rate
    
    Service-->>API: TaxCalculationResult {<br/>compositeRate, state_tax,<br/>county_tax, city_tax,<br/>special_tax, tax_amount,<br/>total_amount, jurisdictions}
    
    Note over API: Format Response<br/>(add percentages)
    
    API-->>User: 200 OK<br/>{subtotal, tax_amount,<br/>total_amount, tax_breakdown,<br/>jurisdictions, location}
```

## 2. Order Creation Flow

```mermaid
sequenceDiagram
    participant Frontend as React Frontend
    participant API as Express API
    participant Service as OrderService
    participant DB as PostgreSQL
    participant Orders as orders table

    Frontend->>API: POST /orders<br/>{user_id, subtotal,<br/>longitude, latitude}
    
    Note over API: Validate Request
    API->>DB: Check user exists<br/>SELECT * FROM user WHERE id = ?
    DB-->>API: User data or null
    
    alt User not found
        API-->>Frontend: 404 Error<br/>"User not found"
    else User exists
        API->>Service: createOrder(data)
        
        Service->>Service: calculateTax(subtotal, lng, lat)
        Note over Service: [Same tax calculation<br/>process as diagram 1]
        Service-->>Service: TaxCalculationResult
        
        Service->>Orders: INSERT INTO orders<br/>(user_id, subtotal, longitude,<br/>latitude, tax_rate, state_tax,<br/>county_tax, city_tax,<br/>special_tax, tax_amount,<br/>total_amount, applied_jurisdiction,<br/>jurisdiction_level, status)
        
        Orders-->>Service: New Order with ID
        
        Service->>DB: Include user data<br/>JOIN with user table
        DB-->>Service: Order with user info
        
        Service-->>API: Created Order object
        API-->>Frontend: 201 Created<br/>{message, order}
        
        Note over Frontend: Show success message<br/>Clear form after 3 seconds
    end
```

## 3. Geographic Lookup Process (PostGIS)

```mermaid
flowchart TD
    Start([Coordinates Received<br/>lat, lng]) --> CreatePoint[Create Point Geometry<br/>ST_Point lng, lat]
    
    CreatePoint --> SetSRID[Set Coordinate System<br/>ST_SetSRID point, 4326<br/>WGS84]
    
    SetSRID --> QueryCity{Query ny_cities<br/>ST_Contains geom, point}
    
    QueryCity -->|Found| CityResult[City: name, geometry]
    QueryCity -->|Not Found| NoCity[No City]
    
    CityResult --> QueryCounty
    NoCity --> QueryCounty{Query ny_counties<br/>ST_Contains geom, point}
    
    QueryCounty -->|Found| CountyResult[County: name, geometry]
    QueryCounty -->|Not Found| Error[Error: Outside NY State]
    
    CountyResult --> Combine[Combine Results]
    CityResult --> Combine
    
    Combine --> Return[Return Jurisdictions Array<br/>[{name, level: 'city'},<br/>{name, level: 'county'}]]
    
    Return --> End([Continue to Tax Lookup])
    Error --> EndError([Throw Error])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style EndError fill:#ffcdd2
    style CreatePoint fill:#fff9c4
    style SetSRID fill:#fff9c4
    style QueryCity fill:#ffe0b2
    style QueryCounty fill:#ffe0b2
```

## 4. Tax Rate Determination Logic

```mermaid
flowchart TD
    Start([Jurisdictions Array]) --> HasCity{City Found<br/>in array?}
    
    HasCity -->|Yes| QueryCityTax[Query city_tax table<br/>WHERE city LIKE name]
    HasCity -->|No| QueryCountyOnly[Query county_tax table<br/>WHERE county LIKE name]
    
    QueryCityTax --> CityTaxFound{City Tax<br/>Exists?}
    
    CityTaxFound -->|Yes| UseCityRate[Use City Rate<br/>applied_level = 'City']
    CityTaxFound -->|No| QueryCountyTax[Query county_tax table<br/>WHERE county LIKE name]
    
    QueryCountyTax --> CountyTaxFound{County Tax<br/>Exists?}
    QueryCountyOnly --> CountyTaxFound
    
    CountyTaxFound -->|Yes| UseCountyRate[Use County Rate<br/>applied_level = 'County']
    CountyTaxFound -->|No| ErrorNoRate[Error: Tax rate not found]
    
    UseCityRate --> Calculate
    UseCountyRate --> Calculate[Calculate Tax Components]
    
    Calculate --> StateTax[State Tax<br/>= amount × 0.04]
    StateTax --> LocalTax[Local Tax<br/>= amount × rate - 0.04]
    LocalTax --> SpecialTax[Special Tax MCTD<br/>= amount × special_rate]
    
    SpecialTax --> TotalTax[Total Tax<br/>= state + local + special]
    TotalTax --> FinalAmount[Total Amount<br/>= subtotal + total_tax]
    
    FinalAmount --> Return([Return Result])
    ErrorNoRate --> EndError([Throw Error])
    
    style Start fill:#e1f5ff
    style Return fill:#c8e6c9
    style EndError fill:#ffcdd2
    style Calculate fill:#fff9c4
    style StateTax fill:#b2dfdb
    style LocalTax fill:#b2dfdb
    style SpecialTax fill:#b2dfdb
    style TotalTax fill:#80cbc4
    style FinalAmount fill:#4db6ac
```

## 5. Frontend User Interaction Flow

```mermaid
flowchart TD
    Start([User Opens<br/>Manual Order Form]) --> EnterData[User Enters:<br/>• Latitude<br/>• Longitude<br/>• Subtotal]
    
    EnterData --> Debounce[Wait 500ms<br/>Debounce]
    
    Debounce --> Validate{Input Valid?<br/>All fields filled<br/>Numeric values}
    
    Validate -->|No| ShowEmpty[Show Empty<br/>Calculation Panel]
    Validate -->|Yes| CallLocation[API: GET /location<br/>longitude, latitude]
    
    CallLocation --> ShowLocation[Display Location Info<br/>City, County, State]
    
    ShowLocation --> CallCalculate[API: POST /calculate-tax<br/>subtotal, longitude, latitude]
    
    CallCalculate --> CalculateSuccess{Success?}
    
    CalculateSuccess -->|Error| ShowError[Show Error Message<br/>Red Alert Banner]
    CalculateSuccess -->|Success| ShowBreakdown[Display Tax Breakdown:<br/>• State Tax<br/>• County Tax<br/>• City Tax<br/>• Special Tax<br/>• Total]
    
    ShowBreakdown --> EnableSubmit[Enable Create Order Button]
    ShowError --> ShowEmpty
    
    EnableSubmit --> UserSubmit{User Clicks<br/>Create Order?}
    
    UserSubmit -->|No| WaitMore[Wait for Changes]
    WaitMore --> EnterData
    
    UserSubmit -->|Yes| CreateOrder[API: POST /orders<br/>user_id, subtotal,<br/>longitude, latitude]
    
    CreateOrder --> OrderSuccess{Success?}
    
    OrderSuccess -->|Error| ShowOrderError[Show Error Message]
    OrderSuccess -->|Success| ShowSuccess[Show Success Message<br/>Order #ID created]
    
    ShowSuccess --> AutoClear[Wait 3 seconds<br/>Auto-clear form]
    ShowOrderError --> EnableSubmit
    
    AutoClear --> End([Form Ready for<br/>New Order])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style ShowError fill:#ffcdd2
    style ShowOrderError fill:#ffcdd2
    style ShowSuccess fill:#c8e6c9
    style ShowBreakdown fill:#fff9c4
    style CallLocation fill:#e1bee7
    style CallCalculate fill:#e1bee7
    style CreateOrder fill:#e1bee7
```

## 6. Database Schema Relationships

```mermaid
erDiagram
    user ||--o{ Order : places
    Order }o--|| ny_counties : "located_in (via coordinates)"
    Order }o--|| ny_cities : "may_be_in (via coordinates)"
    county_tax ||--|| ny_counties : "defines_rate_for"
    city_tax ||--|| ny_cities : "defines_rate_for"
    
    user {
        int id PK
        string name
        string email
        string password
    }
    
    Order {
        int id PK
        int user_id FK
        decimal subtotal
        decimal longitude
        decimal latitude
        decimal tax_rate
        decimal state_tax
        decimal county_tax
        decimal city_tax
        decimal special_tax
        decimal tax_amount
        decimal total_amount
        string applied_jurisdiction
        string jurisdiction_level
        string county_name
        string city_name
        string status
        datetime created_at
        datetime updated_at
    }
    
    ny_counties {
        int gid PK
        string name
        string abbrev
        string fips_code
        float pop2020
        geometry geom "PostGIS"
    }
    
    ny_cities {
        int gid PK
        string name
        string muni_type
        string county
        float pop2020
        geometry geom "PostGIS"
    }
    
    county_tax {
        int id PK
        string county
        decimal tax
        decimal special_rate
    }
    
    city_tax {
        int id PK
        string city
        decimal tax
        decimal special_rate
    }
```

## 7. Tax Calculation Detailed Algorithm

```mermaid
flowchart TD
    Start([Input: amount, rate, special_rate]) --> ConvertRate[Convert Rate to Decimal<br/>rate_decimal = rate / 100<br/>special_decimal = special_rate / 100]
    
    ConvertRate --> StateCalc[Calculate State Tax<br/>state_rate = 0.04 4%<br/>state_tax = amount × 0.04]
    
    StateCalc --> LocalCalc[Calculate Local Tax<br/>local_rate = rate_decimal - 0.04<br/>local_tax = amount × local_rate]
    
    LocalCalc --> SpecialCalc[Calculate Special Tax<br/>special_tax = amount × special_decimal]
    
    SpecialCalc --> TotalTaxCalc[Calculate Total Tax<br/>tax_amount = amount × rate_decimal]
    
    TotalTaxCalc --> FinalCalc[Calculate Final Amount<br/>total_amount = amount + tax_amount]
    
    FinalCalc --> Breakdown{Need Detailed<br/>Breakdown?}
    
    Breakdown -->|Yes| SplitLocal[Split Local Tax<br/>into County + City]
    Breakdown -->|No| Return
    
    SplitLocal --> CheckLevel{Applied<br/>Level?}
    
    CheckLevel -->|City| CityBreakdown[city_tax = local_tax - special_tax<br/>county_tax = 0]
    CheckLevel -->|County| CountyBreakdown[county_tax = local_tax - special_tax<br/>city_tax = 0]
    
    CityBreakdown --> Return[Return Result Object:<br/>• state_tax<br/>• county_tax<br/>• city_tax<br/>• special_tax<br/>• tax_amount<br/>• total_amount]
    
    CountyBreakdown --> Return
    
    Return --> End([Tax Calculation Complete])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style ConvertRate fill:#fff9c4
    style StateCalc fill:#b2dfdb
    style LocalCalc fill:#b2dfdb
    style SpecialCalc fill:#b2dfdb
    style TotalTaxCalc fill:#80cbc4
    style FinalCalc fill:#4db6ac
    style Return fill:#26a69a
```

## Usage

Copy any of these Mermaid diagrams into:
- GitHub markdown (renders automatically)
- Mermaid Live Editor (https://mermaid.live/)
- Documentation tools that support Mermaid
- VS Code with Mermaid extension

## Diagram Descriptions

1. **Complete System Flow**: End-to-end sequence of API call and tax calculation
2. **Order Creation Flow**: Process of creating and storing an order
3. **Geographic Lookup**: PostGIS spatial query process
4. **Tax Rate Determination**: Decision tree for choosing tax rate
5. **Frontend Flow**: User interaction with the React component
6. **Database Schema**: Entity relationships and table structure
7. **Tax Calculation Algorithm**: Detailed step-by-step calculation logic
