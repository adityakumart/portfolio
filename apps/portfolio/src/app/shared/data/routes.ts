export const appRoutingList = [
  {
    link: '/',
    label: 'Home',
    icon: 'home',
  },
  {
    link: '/calculator',
    label: 'Calculator',
    icon: 'calculate',
  },
  {
    link: '/dev-tools',
    label: 'Dev Tools',
    icon: 'code_xml',
    children: [
      {
        header: 'Formatters',
        tools: ['JSON', 'HTML', 'CSS', 'JS'],
      },
      {
        header: 'Encode/Decode',
        tools: ['Base64', 'MD5', 'SHA256', 'JWT', 'URL'],
      },
      {
        header: 'Converters',
        tools: ['JSON to CSV/TS/Schema', 'Query String', 'Number Base'],
      },
      {
        header: 'Generator',
        tools: ['QR', 'Array', 'Number', 'Objects', 'UUID', 'Hash', 'Password'],
      },
    ],
  },
  {
    link: '/json-to-typescript',
    label: 'JSON to TypeScript',
    icon: 'code',
  },
  {
    link: '/line-splitter',
    label: 'Line Splitter',
    icon: 'format_list_numbered',
  },
  {
    link: '/user',
    label: 'User',
    icon: 'account_circle',
  },
  // {
  //   link: "/formbuilder",
  //   label: "Dynamic Form",
  //   icon: "dynamic_form"
  // }
];
