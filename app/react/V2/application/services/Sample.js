const entity = {
  _id: '1',
  title: 'Simple title',
  sharedId: 'entity1',
  creationDate: { value: 1659438982222 },
  editDate: { value: 1663758775194 },
  icon: { _id: 'SMR' },
  template: {
    _id: '1',
    name: 'template1',
    label: 'Template 1',
    color: '#00000',
  },
  metadata: [
    {
      name: 'geolocationisolated',
      label: 'Geolocation Isolated',
      type: 'geolocation',
      values: [
        {
          value: { latitude: 44, longitude: 26 },
          displayValue: '44°N, 26°E',
          properties: {
            template: '',
            info: 'Geolocation Isolated',
            color: '#000000',
            entity: { id: '1', title: 'Simple title' },
          },
          coordinateData: {
            lat: 44,
            lng: 26,
            latDMS: '44°00\'00"N',
            lngDMS: '26°00\'00"E',
            decimalLng: 26.0,
            hemisphere: { lat: 'N', lng: 'E' },
            precision: 6,
          },
        },
      ],
      propertyMedatada: {
        showInCard: true,
        fullWidth: false,
        mapCenter: { latitude: 44, longitude: 26 },
        mapBounds: { north: 44.1, south: 43.9, east: 26.1, west: 25.9 },
      },
    },
    {
      name: 'text_label',
      label: 'Text Label',
      type: 'text',
      values: [{ value: 'Text1' }],
    },
    {
      name: 'markdown',
      label: 'Markdown',
      type: 'markdown',
      values: [
        {
          value: '# A first-level heading\n## A second-level heading\n### A third-level heading\n',
        },
      ],
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      values: [{ value: 1759363200, label: '2025-10-02' }],
    },
    {
      name: 'multidate',
      label: 'Multiple',
      type: 'multidate',
      values: [
        {
          value: 1759276800,
          label: '2025-01-25',
          timelineEvent: {
            formattedDate: 'Jan 25, 2025',
            dateFormats: {
              short: '1/25/25',
              medium: 'Jan 25, 2025',
              long: 'January 25, 2025',
              full: 'Saturday, January 25, 2025',
              iso: '2025-01-25',
              relative: 'in 3 months',
            },
          },
        },
        {
          value: 1759363200,
          label: '2025-10-02',
          formattedDate: 'Oct 2, 2025',
          dateFormats: {
            short: '10/2/25',
            medium: 'Oct 2, 2025',
            long: 'October 2, 2025',
            full: 'Thursday, October 2, 2025',
            iso: '2025-10-02',
            relative: 'in 9 months',
          },
        },
        {
          value: 1759449600,
          label: '2025-10-03',
          formattedDate: 'Oct 3, 2025',
          dateFormats: {
            short: '10/3/25',
            medium: 'Oct 3, 2025',
            long: 'October 3, 2025',
            full: 'Friday, October 3, 2025',
            iso: '2025-10-03',
            relative: 'in 9 months',
          },
        },
      ],
      propertyMedatada: {
        showInCard: true,
      },
    },
    {
      name: 'daterange',
      label: 'Daterange',
      type: 'daterange',
      values: [{ value: { from: 1759276800, to: 1761955199 }, label: '2025-10-01 ~ 2025-10-31' }],
    },
    {
      name: 'multidaterange',
      label: 'Multidaterange',
      type: 'multidaterange',
      values: [
        { value: { from: 1759276800, to: 1759449599 }, label: '2025-10-01 ~ 2025-10-02' },
        { value: { from: 1759363200, to: 1759535999 }, label: '2025-10-02 ~ 2025-10-03' },
      ],
    },
    {
      name: 'select',
      label: 'Select',
      type: 'select',
      values: [{ value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630', label: 'Again' }],
      options: [
        {
          label: 'Acknowledging',
          id: '765ab6ca-56a1-4948-9dc9-17fc0aa30843',
        },
        {
          label: 'Again',
          id: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
        },
        {
          label: 'Citing',
          id: '7a6987aa-2fd5-4ef2-a2d2-c6b1bee1e7c1',
        },
        {
          label: 'Confirming',
          id: '240c244f-a736-4ad4-b777-e690e3ff78f0',
        },
        {
          label: 'Emphasizing',
          id: 'ff786d5a-3c27-4e61-9de1-0aa07e7137cb',
        },
        {
          label: 'Expressing',
          id: '6c744926-bf38-4f98-8c74-cf6b7280863c',
        },
        {
          label: 'Guided by',
          id: 'fe08f3ab-3928-4ffe-b8a5-50f4fcd7dba0',
        },
        {
          label: 'Noting',
          id: 'd2f9f479-fe15-4f2a-b8bc-df7c6de9e8cf',
        },
        {
          label: 'Observing',
          id: 'a3937116-403f-4a50-a5ae-f14270bab534',
        },
        {
          label: 'Reaffirming',
          id: '7665dca1-b5a5-47bf-89ca-a490d1881004',
        },
        {
          label: 'Recalling',
          id: '2a482a0a-974b-4c75-b27e-ba07c6277914',
        },
        {
          label: 'Recognizing',
          id: 'ab14667e-2abc-431d-a175-dc69c385b90c',
        },
        {
          label: 'Referring To',
          id: '3c0a6efc-af76-416e-8324-8c2b6daea3ca',
        },
        {
          label: 'Stating',
          id: 'f0890323-b160-409f-9fd8-8756e2586831',
        },
        {
          label: 'Taking Into Account',
          id: 'c0d8c83c-9843-48ac-8681-880a1ad3a68d',
        },
        {
          label: 'Taking note',
          id: 'e5352747-5748-4b9c-b26b-f18f9992f899',
        },
        {
          label: 'Underscoring',
          id: '8d8ee550-1d79-433a-bd73-d74f1ffd5567',
        },
        {
          label: 'Urges',
          id: 'e1bc413c-384b-4b3b-a4f2-a4c1dffd6ba7',
        },
        {
          label: 'Welcomes',
          id: '98e5835e-af4a-49b2-840c-b5446360beff',
        },
        {
          label: 'Welcoming',
          id: '33f9f9de-30a7-4271-b4f6-289312d0a446',
        },
        {
          label: 'grouped',
          values: [
            {
              label: 'verb1',
              id: 'e1b9944b-43ef-4989-837b-b3df79284b00',
            },
            {
              label: 'verb2',
              id: '8c418311-1244-4777-800a-65729b8c17a8',
            },
          ],
          id: '68979984-35ac-4b98-abf9-28eac857749c',
        },
      ],
    },
    {
      name: 'multiselect',
      label: 'Multiselect',
      type: 'multiselect',
      values: [
        {
          value: '765ab6ca-56a1-4948-9dc9-17fc0aa30843',
          label: 'Acknowledging',
        },
        {
          value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
          label: 'Again',
        },
        {
          value: '8c418311-1244-4777-800a-65729b8c17a8',
          label: 'verb2',
          parent: { value: '68979984-35ac-4b98-abf9-28eac857749c', label: 'grouped' },
          displayValue: 'grouped: verb2',
        },
      ],
      options: [
        {
          value: '765ab6ca-56a1-4948-9dc9-17fc0aa30843',
          label: 'Acknowledging',
        },
        {
          value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
          label: 'Again',
        },
      ],
      propertyMedatada: {
        showInCard: true,
      },
    },
    {
      name: 'relationship',
      label: 'Relationship',
      type: 'relationship',
      inherited: false,
      relationshipName: 'People related to event',
      values: [
        {
          value: 'xjku67dv7b',
          label: 'Context trimming sample2',
          icon: '',
          url: '/entity/xjku67dv7b',
          displayValue: 'Context trimming sample2 EN',
          relationshipData: {
            entityId: 'xjku67dv7b',
            entityTitle: 'Context trimming sample2',
            relationshipType: 'related_to',
            template: { id: '5bfbb1a0471dd0fc16ada146', name: 'Document', color: '#16bdca' },
          },
        },
        {
          value: '4oklamamet',
          label: 'Context trimming sample3',
          icon: '',
          url: '/entity/4oklamamet',
          displayValue: 'Context trimming sample3 EN',
          relationshipData: {
            entityId: '4oklamamet',
            entityTitle: 'Context trimming sample3',
            relationshipType: 'related_to',
            template: { id: '5bfbb1a0471dd0fc16ada146', name: 'Document', color: '#16bdca' },
          },
        },
      ],
      propertyMedatada: {
        template: {
          _id: '5bfbb1a0471dd0fc16ada146',
          name: 'Document',
          label: 'Document EN',
          color: '#16bdca',
          entityViewPage: '',
        },
      },
      propertyMedatada: {
        showInCard: true,
        totalRelationships: 2,
      },
    },
    {
      name: 'relationship',
      label: 'Relationship',
      type: 'relationship',
      inherited: true,
      values: [
        {
          value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
          label: 'Again',
        },
        {
          value: '765ab6ca-56a1-4948-9dc9-17fc0aa30843',
          label: 'Acknowledging',
        },
      ],
      properties: {
        template: {
          _id: '5bfbb1a0471dd0fc16ada146',
          name: 'Document',
          label: 'Document EN',
          color: '#16bdca',
          entityViewPage: '',
        },
        entity: {},
        relationType: {
          _id: '68da99b961bceda4fe0d6ddd',
          name: 'Document',
        },
        inheritedProperty: {
          _id: '68d6f62891b591b7432b2b4b',
          property: 'multiselect',
          type: 'multiselect',
        },
      },
      link: {
        values: [
          {
            value: 'www.google.com',
            label: 'google',
          },
        ],
      },
      image: {
        values: [
          {
            value: '/api/files/17593747059321ygqk22fdos.png',
            label: 'image',
          },
        ],
      },
      preview: {
        values: [
          {
            value: '',
          },
        ],
      },
      media: {
        values: [
          {
            value: '/api/files/1759374705932xi5rx0mumef.mp4',
            timelinks: [
              {
                time: '00:20:15',
                hh: '00',
                mm: '00',
                ss: '15',
                label: 'control',
              },
            ],
            // Embedded media player UI information
            mediaFile: {
              url: '/api/files/1759374705932xi5rx0mumef.mp4',
              filename: '1759374705932xi5rx0mumef.mp4',
              originalname: 'Sample Video.mp4',
              mimetype: 'video/mp4',
              size: 1024000,
              thumbnail: '/api/files/1759374705932xi5rx0mumef_thumb.jpg',
            },
            // Embedded timelink UI information
            timelinkData: {
              time: '00:20:15',
              timestamp: 1215, // seconds
              label: 'control',
              // Enhanced time breakdown for UI components
              hours: 0,
              minutes: 20,
              seconds: 15,
              totalSeconds: 1215,
              formattedTime: '0:20:15',
              shortTime: '20:15',
            },
          },
        ],
        propertyMedatada: {
          showInCard: true,
          defaultStyle: 'compact',
        },
      },
      combined_geolocation: {
        values: [
          {
            value: {
              latitude: 44.33301685687683,
              longitude: 5.998535156250001,
              label: 'Geolocation',
              color: '#000000',
              template: '',
              displayValue: '44°N, 26°E',
            },
            coordinateData: {
              lat: 44.33301685687683,
              lng: 5.998535156250001,
              latDMS: '44°19\'58.86"N',
              lngDMS: '5°59\'53.36"E',
              decimalLat: 44.33301685687683,
              decimalLng: 5.998535156250001,
              hemisphere: { lat: 'N', lng: 'E' },
              precision: 6,
              accuracy: 'high',
            },
          },
          {
            value: {
              lat: 44.33301685687683,
              lon: 5.998535156250001,
              label: 'Geolocation2',
              color: '#000000',
              template: '',
              displayValue: '44°N, 26°E',
            },
            // Enhanced coordinate data for UI components
            coordinateData: {
              lat: 44.33301685687683,
              lng: 5.998535156250001,
              latDMS: '44°19\'58.86"N',
              lngDMS: '5°59\'53.36"E',
              decimalLat: 44.33301685687683,
              decimalLng: 5.998535156250001,
              hemisphere: { lat: 'N', lng: 'E' },
              precision: 6,
              accuracy: 'high',
            },
          },
          {
            value: {
              lat: 43.80157978110818,
              lon: 43.80157978110818,
              label: 'GeolocationR',
              color: '#000000',
              template: 'Document',
              displayValue: '44°N, 26°E',
            },
            // Enhanced coordinate data for UI components
            coordinateData: {
              lat: 43.80157978110818,
              lng: 43.80157978110818,
              latDMS: '43°48\'5.69"N',
              lngDMS: '43°48\'5.69"E',
              decimalLat: 43.80157978110818,
              decimalLng: 43.80157978110818,
              hemisphere: { lat: 'N', lng: 'E' },
              precision: 6,
              accuracy: 'high',
            },
          },
        ],
        propertyMedatada: {
          showInCard: true,
          mapCenter: { latitude: 44, longitude: 26 },
          mapBounds: { north: 44.1, south: 43.9, east: 26.1, west: 25.9 },
          grouped: true,
          totalMarkers: 3,
        },
      },
      generatedid: {
        values: [
          {
            value: 'BDZ3505-3650',
          },
        ],
      },
    },
  ],
};

const rawEntity = {
  _id: '68dded72c9474e23bb5e9254',
  language: 'en',
  mongoLanguage: 'en',
  sharedId: '36l0vr92qce',
  title: 'Full entity',
  template: '68ddecdbc9474e23bb5e914b',
  published: false,
  creationDate: 1759374706197,
  editDate: 1759895900695,
  metadata: {
    text_label: [
      {
        value: 'Text1',
      },
    ],
    markdown: [
      {
        value: '# A first-level heading\n## A second-level heading\n### A third-level heading\n',
      },
    ],
    date: [
      {
        value: 1759363200,
      },
    ],
    multidate: [
      {
        value: 1759276800,
      },
      {
        value: 1759363200,
      },
      {
        value: 1759449600,
      },
    ],
    daterange: [
      {
        value: {
          from: 1759276800,
          to: 1761955199,
        },
      },
    ],
    multidaterange: [
      {
        value: {
          from: 1759276800,
          to: 1759449599,
        },
      },
      {
        value: {
          from: 1759363200,
          to: 1759535999,
        },
      },
    ],
    select: [
      {
        value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
        label: 'Again',
      },
    ],
    multiselect: [
      {
        value: '765ab6ca-56a1-4948-9dc9-17fc0aa30843',
        label: 'Acknowledging',
      },
      {
        value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
        label: 'Again',
      },
      {
        value: '8c418311-1244-4777-800a-65729b8c17a8',
        label: 'verb2',
        parent: {
          value: '68979984-35ac-4b98-abf9-28eac857749c',
          label: 'grouped',
        },
      },
    ],
    relationship: [
      {
        value: 'xjku67dv7b',
        label: 'Context trimming sample2',
        icon: {
          _id: 'ECU',
          label: 'Ecuador',
          type: 'Flags',
        },
        type: 'entity',
        inheritedValue: [
          {
            value: '9e22a1af-75d7-49a2-b9d8-9ec77939b630',
            label: 'Again',
          },
          {
            value: '765ab6ca-56a1-4948-9dc9-17fc0aa30843',
            label: 'Acknowledging',
          },
        ],
        inheritedType: 'multiselect',
      },
      {
        value: '4oklamamet',
        label: 'Context trimming sample3',
        icon: '',
        type: 'entity',
        inheritedValue: [],
        inheritedType: 'multiselect',
      },
    ],
    relationship1: [
      {
        value: 'xjku67dv7b',
        label: 'Context trimming sample2',
        icon: {
          _id: 'ECU',
          label: 'Ecuador',
          type: 'Flags',
        },
        type: 'entity',
      },
      {
        value: '4oklamamet',
        label: 'Context trimming sample3',
        icon: '',
        type: 'entity',
      },
    ],
    link: [
      {
        value: {
          label: 'google',
          url: 'www.google.com',
        },
      },
    ],
    image: [
      {
        value: '/api/files/17593747059321ygqk22fdos.png',
      },
    ],
    preview: [
      {
        value: '',
      },
    ],
    media: [
      {
        value: '(/api/files/1759374705932xi5rx0mumef.mp4, {"timelinks":{"00:20:15":"control"}})',
      },
    ],
    geolocation_geolocation: [
      {
        value: {
          lat: 44.33301685687683,
          lon: 5.998535156250001,
          label: '',
        },
      },
    ],
    geolocationr: [
      {
        value: 'xjku67dv7b',
        label: 'Context trimming sample2',
        icon: {
          _id: 'ECU',
          label: 'Ecuador',
          type: 'Flags',
        },
        type: 'entity',
        inheritedValue: [
          {
            value: {
              lat: 43.80157978110818,
              lon: 43.80157978110818,
              label: '',
            },
          },
        ],
        inheritedType: 'geolocation',
      },
      {
        value: '4oklamamet',
        label: 'Context trimming sample3',
        icon: '',
        type: 'entity',
        inheritedValue: [],
        inheritedType: 'geolocation',
      },
    ],
    generatedid: [
      {
        value: 'BDZ3505-3650',
      },
    ],
    geolocationisolated_geolocation: [
      {
        value: {
          lat: 46.3964365565104,
          lon: 3.6694335937500004,
          label: '',
        },
      },
    ],
    geolocation2_geolocation: [
      {
        value: {
          lat: 62.58069554111894,
          lon: 15.468750000000002,
          label: '',
        },
      },
    ],
  },
  user: '58ada34d299e82674854510f',
  permissions: [
    {
      refId: '58ada34d299e82674854510f',
      type: 'user',
      level: 'write',
    },
  ],
  obsoleteMetadata: [],
  __v: 4,
};

const template = {
  _id: '5bfbb1a0471dd0fc16ada146',
  name: 'Document',
  commonProperties: [
    {
      _id: '5bfbb1a0471dd0fc16ada148',
      label: 'Title',
      name: 'title',
      isCommonProperty: true,
      type: 'text',
      prioritySorting: false,
    },
    {
      _id: '5bfbb1a0471dd0fc16ada147',
      label: 'Date added',
      name: 'creationDate',
      isCommonProperty: true,
      type: 'date',
      prioritySorting: false,
    },
    {
      _id: '68da9640ea8d8c69971bf274',
      label: 'Date modified',
      name: 'editDate',
      type: 'date',
      isCommonProperty: true,
    },
  ],
  properties: [
    {
      _id: '68d56f072489957bf47a600b',
      type: 'date',
      label: 'Date',
      noLabel: false,
      required: false,
      showInCard: false,
      filter: false,
      defaultfilter: false,
      prioritySorting: false,
      style: '',
      generatedId: false,
      name: 'date',
    },
    {
      content: '68d6ed4891b591b7432b276b',
      _id: '68d6f62891b591b7432b2b4b',
      type: 'multiselect',
      label: 'Multiselect',
      noLabel: false,
      required: false,
      showInCard: false,
      filter: false,
      defaultfilter: false,
      prioritySorting: false,
      style: '',
      generatedId: false,
      name: 'multiselect',
    },
    {
      _id: '68da993261bceda4fe0d6c49',
      type: 'markdown',
      label: 'Markdown',
      noLabel: false,
      required: false,
      showInCard: false,
      filter: false,
      defaultfilter: false,
      prioritySorting: false,
      style: '',
      generatedId: false,
      name: 'markdown',
    },
    {
      content: '68d6ed4891b591b7432b276b',
      _id: '68daaa5561bceda4fe1014d8',
      type: 'multiselect',
      label: 'Multiselect from text',
      noLabel: false,
      required: false,
      showInCard: false,
      filter: false,
      defaultfilter: false,
      prioritySorting: false,
      style: '',
      generatedId: false,
      name: 'multiselect_from_text',
    },
  ],
  __v: 7,
  default: false,
  color: '#16bdca',
  entityViewPage: '',
};

const relationshipTypes = [
  {
    _id: '68da99d961bceda4fe0d6e0f',
    name: 'related to',
    properties: [],
    __v: 0,
  },
  {
    _id: '68da99b961bceda4fe0d6ddd',
    name: 'related from',
    properties: [],
    __v: 1,
  },
];
export default entity;
