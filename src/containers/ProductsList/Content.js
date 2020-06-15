import React from 'react';
import { createConnector } from 'react-instantsearch';
import ContentElement from './ContentElement';
import EmptyComponent from '@iso/components/EmptyComponent';
import { LoaderElement } from '@iso/components/Algolia/AlgoliaComponent.style';

const CustomResults = createConnector({
  displayName: 'CustomResults',
  getProvidedProps(props, searchState, searchResults) {
    const status = searchResults.results
      ? searchResults.results.nbHits === 0
      : 'loading';
      
      console.log('xxxx c',searchResults.results)
    return { query: searchState.query, status, props };
  },
})(({ status, query, ...props }) => {
  console.log('xxxx evet geldi',status)
  if (status === 'loading') {
    return <ContentElement  />;
  } else if (status) {
    return <EmptyComponent value="Kayıt bulunamamıştır" />;
  } else {
    console.log('xxxx evet geldi1212',props)
    return <ContentElement  />;
  }
});

export default CustomResults;
