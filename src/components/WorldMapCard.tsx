import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { useState } from "react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Country {
  name: string;
  code: string;
  count: number;
  pct: number;
}

interface Props {
  countries?: Country[];
}

// Map ISO 2-letter codes to ISO 3166-1 numeric (used by topojson)
const iso2ToNumeric: Record<string, string> = {
  AF:"004",AL:"008",DZ:"012",AS:"016",AD:"020",AO:"024",AG:"028",AR:"032",AM:"051",AU:"036",
  AT:"040",AZ:"031",BS:"044",BH:"048",BD:"050",BB:"052",BY:"112",BE:"056",BZ:"084",BJ:"204",
  BT:"064",BO:"068",BA:"070",BW:"072",BR:"076",BN:"096",BG:"100",BF:"854",BI:"108",KH:"116",
  CM:"120",CA:"124",CV:"132",CF:"140",TD:"148",CL:"152",CN:"156",CO:"170",KM:"174",CG:"178",
  CD:"180",CR:"188",CI:"384",HR:"191",CU:"192",CY:"196",CZ:"203",DK:"208",DJ:"262",DM:"212",
  DO:"214",EC:"218",EG:"818",SV:"222",GQ:"226",ER:"232",EE:"233",ET:"231",FJ:"242",FI:"246",
  FR:"250",GA:"266",GM:"270",GE:"268",DE:"276",GH:"288",GR:"300",GD:"308",GT:"320",GN:"324",
  GW:"624",GY:"328",HT:"332",HN:"340",HU:"348",IS:"352",IN:"356",ID:"360",IR:"364",IQ:"368",
  IE:"372",IL:"376",IT:"380",JM:"388",JP:"392",JO:"400",KZ:"398",KE:"404",KI:"296",KP:"408",
  KR:"410",KW:"414",KG:"417",LA:"418",LV:"428",LB:"422",LS:"426",LR:"430",LY:"434",LI:"438",
  LT:"440",LU:"442",MK:"807",MG:"450",MW:"454",MY:"458",MV:"462",ML:"466",MT:"470",MH:"584",
  MR:"478",MU:"480",MX:"484",FM:"583",MD:"498",MC:"492",MN:"496",ME:"499",MA:"504",MZ:"508",
  MM:"104",NA:"516",NR:"520",NP:"524",NL:"528",NZ:"554",NI:"558",NE:"562",NG:"566",NO:"578",
  OM:"512",PK:"586",PW:"585",PA:"591",PG:"598",PY:"600",PE:"604",PH:"608",PL:"616",PT:"620",
  QA:"634",RO:"642",RU:"643",RW:"646",KN:"659",LC:"662",VC:"670",WS:"882",SM:"674",ST:"678",
  SA:"682",SN:"686",RS:"688",SC:"690",SL:"694",SG:"702",SK:"703",SI:"705",SB:"090",SO:"706",
  ZA:"710",SS:"728",ES:"724",LK:"144",SD:"729",SR:"740",SZ:"748",SE:"752",CH:"756",SY:"760",
  TW:"158",TJ:"762",TZ:"834",TH:"764",TL:"626",TG:"768",TO:"776",TT:"780",TN:"788",TR:"792",
  TM:"795",TV:"798",UG:"800",UA:"804",AE:"784",GB:"826",US:"840",UY:"858",UZ:"860",VU:"548",
  VE:"862",VN:"704",YE:"887",ZM:"894",ZW:"716",PS:"275",XK:"412",
};

export function WorldMapCard({ countries = [] }: Props) {
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null);

  const countryByNumeric: Record<string, Country> = {};
  countries.forEach((c) => {
    const numeric = iso2ToNumeric[c.code];
    if (numeric) countryByNumeric[numeric] = c;
  });

  const maxCount = Math.max(...countries.map((c) => c.count), 1);

  function getFill(geoId: string): string {
    const c = countryByNumeric[geoId];
    if (!c) return "hsl(var(--muted))";
    const intensity = Math.max(0.2, c.count / maxCount);
    return `hsl(var(--primary) / ${intensity})`;
  }

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up relative">
      <h3 className="text-sm font-semibold text-foreground mb-3">Visitor Map</h3>
      {countries.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-16">No country data yet</p>
      ) : (
        <div className="w-full aspect-[2/1] relative">
          <ComposableMap
            projectionConfig={{ scale: 147, center: [0, 20] }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const geoId = geo.id;
                    const match = countryByNumeric[geoId];
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getFill(geoId)}
                        stroke="hsl(var(--border))"
                        strokeWidth={0.4}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "hsl(var(--primary))", cursor: "pointer" },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={(e) => {
                          if (match) {
                            setTooltip({
                              name: match.name,
                              count: match.count,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          {tooltip && (
            <div
              className="fixed z-50 px-3 py-1.5 rounded-lg bg-popover border border-border text-xs shadow-lg pointer-events-none"
              style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
            >
              <span className="font-semibold text-foreground">{tooltip.name}</span>
              <span className="text-muted-foreground ml-2">{tooltip.count} visits</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
