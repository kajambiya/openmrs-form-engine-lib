import { openmrsFetch } from '@openmrs/esm-framework';
import { DataSource, EncounterProvider, OHRIFormField, UuidAndDisplay } from '../api/types';
import { resolve } from '../utils/expression-runner';

export class EncounterLocationDataSource implements DataSource<EncounterProvider> {
  private readonly url = '/ws/rest/v1/location?tag=8d4626ca-7abd-42ad-be48-56767bbcf272&v=custom:(uuid,display)';

  fetchData(searchTerm: string): Promise<any[]> {
    return openmrsFetch(searchTerm ? `${this.url}&q=${searchTerm}` : this.url).then(({ data }) => {
      return data.results;
    });
  }

  toUuidAndDisplay(provider: any): UuidAndDisplay {
    return {
      uuid: provider.uuid,
      display: provider.person.display,
    };
  }
}
