import { Injectable, NotFoundException } from '@nestjs/common';
import { RegionsRepository } from './regions.repository';
import { v4 as uuid } from 'uuid';

const ALGERIAN_WILAYAS: Array<{ code: string; name: string }> = [
  { code: 'DZ-01', name: 'Adrar' },
  { code: 'DZ-02', name: 'Chlef' },
  { code: 'DZ-03', name: 'Laghouat' },
  { code: 'DZ-04', name: 'Oum El Bouaghi' },
  { code: 'DZ-05', name: 'Batna' },
  { code: 'DZ-06', name: 'B\u00e9ja\u00efa' },
  { code: 'DZ-07', name: 'Biskra' },
  { code: 'DZ-08', name: 'B\u00e9char' },
  { code: 'DZ-09', name: 'Blida' },
  { code: 'DZ-10', name: 'Bouira' },
  { code: 'DZ-11', name: 'Tamanrasset' },
  { code: 'DZ-12', name: 'T\u00e9bessa' },
  { code: 'DZ-13', name: 'Tlemcen' },
  { code: 'DZ-14', name: 'Tiaret' },
  { code: 'DZ-15', name: 'Tizi Ouzou' },
  { code: 'DZ-16', name: 'Alger' },
  { code: 'DZ-17', name: 'Djelfa' },
  { code: 'DZ-18', name: 'Jijel' },
  { code: 'DZ-19', name: 'S\u00e9tif' },
  { code: 'DZ-20', name: 'Sa\u00efda' },
  { code: 'DZ-21', name: 'Skikda' },
  { code: 'DZ-22', name: 'Sidi Bel Abb\u00e8s' },
  { code: 'DZ-23', name: 'Annaba' },
  { code: 'DZ-24', name: 'Guelma' },
  { code: 'DZ-25', name: 'Constantine' },
  { code: 'DZ-26', name: 'M\u00e9d\u00e9a' },
  { code: 'DZ-27', name: 'Mostaganem' },
  { code: 'DZ-28', name: "M'Sila" },
  { code: 'DZ-29', name: 'Mascara' },
  { code: 'DZ-30', name: 'Ouargla' },
  { code: 'DZ-31', name: 'Oran' },
  { code: 'DZ-32', name: 'El Bayadh' },
  { code: 'DZ-33', name: 'Illizi' },
  { code: 'DZ-34', name: 'Bordj Bou Arr\u00e9ridj' },
  { code: 'DZ-35', name: 'Boumerd\u00e8s' },
  { code: 'DZ-36', name: 'El Tarf' },
  { code: 'DZ-37', name: 'Tindouf' },
  { code: 'DZ-38', name: 'Tissemsilt' },
  { code: 'DZ-39', name: 'El Oued' },
  { code: 'DZ-40', name: 'Khenchela' },
  { code: 'DZ-41', name: 'Souk Ahras' },
  { code: 'DZ-42', name: 'Tipaza' },
  { code: 'DZ-43', name: 'Mila' },
  { code: 'DZ-44', name: 'A\u00efn Defla' },
  { code: 'DZ-45', name: 'Na\u00e2ma' },
  { code: 'DZ-46', name: 'A\u00efn T\u00e9mouchent' },
  { code: 'DZ-47', name: 'Gharda\u00efa' },
  { code: 'DZ-48', name: 'Relizane' },
  { code: 'DZ-49', name: 'Timimoun' },
  { code: 'DZ-50', name: 'Bordj Badji Mokhtar' },
  { code: 'DZ-51', name: 'Ouled Djellal' },
  { code: 'DZ-52', name: "B\u00e9ni Abb\u00e8s" },
  { code: 'DZ-53', name: 'In Salah' },
  { code: 'DZ-54', name: 'In Guezzam' },
  { code: 'DZ-55', name: 'Touggourt' },
  { code: 'DZ-56', name: 'Djanet' },
  { code: 'DZ-57', name: "El M'Ghair" },
  { code: 'DZ-58', name: 'El Meniaa' },
];

@Injectable()
export class RegionsService {
  constructor(private readonly regionsRepository: RegionsRepository) {}

  async listRegions(type?: 'wilaya' | 'commune' | 'village') {
    return this.regionsRepository.findAll(type);
  }

  async getRegion(id: string) {
    const region = await this.regionsRepository.findById(id);
    if (!region) {
      throw new NotFoundException(`Region with id ${id} not found`);
    }
    return region;
  }

  async getRegionByCode(code: string) {
    const region = await this.regionsRepository.findByCode(code);
    if (!region) {
      throw new NotFoundException(`Region with code ${code} not found`);
    }
    return region;
  }

  async getSubRegions(parentId: string) {
    return this.regionsRepository.findChildren(parentId);
  }

  async seedWilayas() {
    const wilayaData = ALGERIAN_WILAYAS.map((w) => ({
      id: uuid(),
      name: w.name,
      code: w.code,
      type: 'wilaya' as const,
    }));

    return this.regionsRepository.seed(wilayaData);
  }
}
