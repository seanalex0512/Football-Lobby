export interface Venue {
  id: string
  name: string
  address: string
  area: string
  hours: string
  type: 'futsal' | 'football' | 'both'
}

export const AREAS = ['All', 'Georgetown', 'Bayan Lepas', 'Butterworth', 'Seberang Jaya', 'Balik Pulau', 'Tanjung Bungah']

export const VENUES: Venue[] = [
  // Georgetown
  {
    id: 'gt-1',
    name: 'Penang Sports Club',
    address: '1 Anson Rd, George Town, 10400 Penang',
    area: 'Georgetown',
    hours: '7:00 AM – 11:00 PM',
    type: 'football',
  },
  {
    id: 'gt-2',
    name: 'Georgetown Futsal Arena',
    address: 'Jalan Macalister, George Town, 10400 Penang',
    area: 'Georgetown',
    hours: '8:00 AM – 12:00 AM',
    type: 'futsal',
  },
  {
    id: 'gt-3',
    name: 'Padang Kota Lama',
    address: 'Pengkalan Weld, George Town, 10300 Penang',
    area: 'Georgetown',
    hours: '6:00 AM – 10:00 PM',
    type: 'football',
  },
  {
    id: 'gt-4',
    name: 'Supreme Futsal',
    address: 'Jalan Anson, George Town, 10400 Penang',
    area: 'Georgetown',
    hours: '9:00 AM – 11:00 PM',
    type: 'futsal',
  },
  // Bayan Lepas
  {
    id: 'bl-1',
    name: 'Bayan Lepas Futsal Centre',
    address: 'Jalan Dato Ismail Hashim, Bayan Lepas, 11900 Penang',
    area: 'Bayan Lepas',
    hours: '8:00 AM – 12:00 AM',
    type: 'futsal',
  },
  {
    id: 'bl-2',
    name: 'Arena Futsal Bayan Baru',
    address: 'Bayan Baru, 11900 Penang',
    area: 'Bayan Lepas',
    hours: '9:00 AM – 11:00 PM',
    type: 'futsal',
  },
  {
    id: 'bl-3',
    name: 'Queensbay Futsal',
    address: 'Persiaran Bayan Indah, Bayan Lepas, 11900 Penang',
    area: 'Bayan Lepas',
    hours: '10:00 AM – 12:00 AM',
    type: 'futsal',
  },
  {
    id: 'bl-4',
    name: 'Penang International Sports Arena',
    address: 'Jalan Bayan Lepas, 11900 Penang',
    area: 'Bayan Lepas',
    hours: '7:00 AM – 11:00 PM',
    type: 'both',
  },
  // Butterworth
  {
    id: 'bw-1',
    name: 'Sunway Carnival Futsal',
    address: 'Jalan Todak, Seberang Jaya, 13700 Penang',
    area: 'Butterworth',
    hours: '10:00 AM – 12:00 AM',
    type: 'futsal',
  },
  {
    id: 'bw-2',
    name: 'Kompleks Sukan Butterworth',
    address: 'Jalan Bagan Dalam, Butterworth, 12000 Penang',
    area: 'Butterworth',
    hours: '7:00 AM – 10:00 PM',
    type: 'football',
  },
  {
    id: 'bw-3',
    name: 'Pro Futsal Butterworth',
    address: 'Jalan Bagan Luar, Butterworth, 12000 Penang',
    area: 'Butterworth',
    hours: '8:00 AM – 12:00 AM',
    type: 'futsal',
  },
  // Seberang Jaya
  {
    id: 'sj-1',
    name: 'Majlis Perbandaran Seberang Perai',
    address: 'Jalan Perda Utama, Bukit Mertajam, 14000 Penang',
    area: 'Seberang Jaya',
    hours: '7:00 AM – 10:00 PM',
    type: 'football',
  },
  {
    id: 'sj-2',
    name: 'Velocity Futsal Seberang Jaya',
    address: 'Perda City Mall, Bukit Mertajam, 14000 Penang',
    area: 'Seberang Jaya',
    hours: '9:00 AM – 11:00 PM',
    type: 'futsal',
  },
  {
    id: 'sj-3',
    name: 'King Futsal Arena',
    address: 'Jalan Todak 4, Seberang Jaya, 13700 Penang',
    area: 'Seberang Jaya',
    hours: '8:00 AM – 12:00 AM',
    type: 'futsal',
  },
  // Tanjung Bungah
  {
    id: 'tb-1',
    name: 'Tanjung Bungah Recreational Park',
    address: 'Jalan Tanjung Bungah, 11200 Penang',
    area: 'Tanjung Bungah',
    hours: '6:00 AM – 10:00 PM',
    type: 'football',
  },
  {
    id: 'tb-2',
    name: 'Northern Futsal Centre',
    address: 'Jalan Batu Ferringhi, Tanjung Bungah, 11200 Penang',
    area: 'Tanjung Bungah',
    hours: '9:00 AM – 11:00 PM',
    type: 'futsal',
  },
  // Balik Pulau
  {
    id: 'bp-1',
    name: 'Balik Pulau Futsal Court',
    address: 'Jalan Balik Pulau, 11000 Penang',
    area: 'Balik Pulau',
    hours: '8:00 AM – 10:00 PM',
    type: 'futsal',
  },
]
