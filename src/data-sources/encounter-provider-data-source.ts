import { openmrsFetch } from '@openmrs/esm-framework';
import { DataSource, EncounterProvider, OHRIFormField, UuidAndDisplay } from '../api/types';
import { resolve } from '../utils/expression-runner';

export class EncounterProviderDataSource implements DataSource<EncounterProvider> {
  private readonly url = '/ws/rest/v1/provider?v=custom:(uuid,display,person:(uuid,display))';

  fetchData(searchTerm: string): Promise<EncounterProvider[]> {
    return openmrsFetch(searchTerm ? `${this.url}&q=${searchTerm}` : this.url).then(({ data }) => {
      return data.results;
    });
  }

  toUuidAndDisplay(provider: EncounterProvider): UuidAndDisplay {
    return {
      uuid: provider.uuid,
      display: provider.person.display,
    };
  }
}
