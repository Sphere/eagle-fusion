export namespace NsContentStripRequest {
  export enum EContentStripRequestTypes {
    SEARCH_REQUEST = 'searchRequest',
    API_REQUEST = 'apiRequest',
    IDS = 'idsRequest',
  }

  export enum ESearchSortOrderTypes {
    ASCENDING = 'ASC',
    DESCENDING = 'DESC',
  }

  export enum ESearchSortByTypes {
    LAST_UPDATED_ON = 'lastUpdatedOn',
    VALUE1 = 'value1',
    VALUE2 = 'value2',
  }
}
