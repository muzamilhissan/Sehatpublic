import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { PatientsRepository } from './patients.repository';

@Injectable()
export class PatientsService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async getMyProfile(userId: string) {
    const patient = await this.patientsRepository.findByUserId(userId);
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }
    return patient;
  }

  async updateMyProfile(userId: string, dto: UpdatePatientProfileDto) {
    const patient = await this.patientsRepository.findByUserId(userId);
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    if (dto.fullName) {
      await this.patientsRepository.updateUser(userId, { fullName: dto.fullName });
    }

    return this.patientsRepository.updateProfile(patient.id, {
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      cnic: dto.cnic,
      cityId: dto.cityId,
    });
  }

  async listDependents(userId: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    return this.patientsRepository.listDependents(patient.id);
  }

  async createDependent(userId: string, dto: CreateDependentDto) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    return this.patientsRepository.createDependent({
      patientId: patient.id,
      fullName: dto.fullName,
      relation: dto.relation,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      cnic: dto.cnic,
    });
  }

  async removeDependent(userId: string, dependentId: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const dependent = await this.patientsRepository.findDependent(dependentId, patient.id);
    if (!dependent) {
      throw new NotFoundException('Dependent not found');
    }
    await this.patientsRepository.deactivateDependent(dependentId);
    return { removed: true };
  }

  async listAddresses(userId: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    return this.patientsRepository.listAddresses(patient.id);
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);

    if (dto.isDefault) {
      await this.patientsRepository.clearDefaultAddresses(patient.id);
    }

    return this.patientsRepository.createAddress({
      patientId: patient.id,
      label: dto.label,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      areaId: dto.areaId,
      cityId: dto.cityId,
      lat: dto.lat,
      lng: dto.lng,
      isDefault: dto.isDefault ?? false,
    });
  }

  async removeAddress(userId: string, addressId: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const address = await this.patientsRepository.findAddress(addressId, patient.id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    await this.patientsRepository.deleteAddress(addressId);
    return { removed: true };
  }
}
