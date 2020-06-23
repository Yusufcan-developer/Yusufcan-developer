import React from 'react';
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import ContentHolder from '@iso/components/utility/contentHolder';
import { Table, Row, Col, Pagination,  TreeSelect } from "antd";
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import GoogleDrive from '@uppy/google-drive';
import Dropbox from '@uppy/dropbox';
import Instagram from '@uppy/instagram';
// import Webcam from '@uppy/webcam'
import { Dashboard } from '@uppy/react';
import { locale } from 'moment';

const UppyDashboard = () => {
  const uppy = Uppy({
    debug: true,
    autoProceed: false,
    locale:{
      strings: {

        // Text to show on the droppable area.
        // `%{browse}` is replaced with a link that opens the system file selection dialog.
        
        // Used as the label for the link that opens the system file selection dialog.
        addingMoreFiles: 'Daha fazla fotoğraf ekle',
        back:'geri',
        done:'tamam',
        complete: 'Başarılı',
        saveChanges: 'Değişiklikleri Kaydet',
        editFile: 'Düzenle',
  editing: 'Düzenle %{file}',
        uploadXFiles: {
          '0': 'Yükle %{smart_count} Fotoğraf',
          '1': 'Yükle %{smart_count} Fotoğraf'
        },
        uploadingXFiles: {
    '0': 'Yükleniyor %{smart_count} fotoğraf',
    '1': 'Yükleniyor %{smart_count} fotoğraf'
  },

        xFilesSelected: {
          '0': '%{smart_count} fotoğraf seçildi',
          '1': '%{smart_count} fotoğraf seçildi'
        },
      
        addMore: 'Ekle',
        addMoreFiles: 'Fotoğraf Ekle',
        cancel: 'İptal',
        cancelUpload: 'Yükleme iptal',
        browse: 'Dosya Aç',
        dropPaste: 'Fotoğraflarınızı buraya bırakın, yapıştırın veya %{browse}',
        dropPasteImport:'Dosyaları buraya bırakın, yapıştırın veya %{browse}'
      }
    },
    // locale: Russian,
    restrictions: {
      maxFileSize: 1000000,
      maxNumberOfFiles: 18,
      minNumberOfFiles: 2,
      allowedFileTypes: ['image/*', 'video/*'],
    },
  });

  uppy.use(GoogleDrive, {
    id: 'GoogleDrive',
    companionUrl: 'https://companion.uppy.io',
  });
  uppy.use(Dropbox, { companionUrl: 'https://companion.uppy.io' });
  uppy.use(Instagram, { companionUrl: 'https://companion.uppy.io' });
  // .use(Webcam)
  uppy.use(Tus, { endpoint: 'https://master.tus.io/files/' });

  uppy.on('complete', result => {
    console.log('successful files:', result.successful);
    console.log('failed files:', result.failed);
  });
  const treeData = [
    {
      title: 'Node1',
      value: '0-0',
      key: '0-0',
      children: [
        {
          title: 'Child Node1',
          value: '0-0-0',
          key: '0-0-0',
        },
      ],
    },
    {
      title: 'Node2',
      value: '0-1',
      key: '0-1',
      children: [
        {
          title: 'Child Node3',
          value: '0-1-0',
          key: '0-1-0',
        },
        {
          title: 'Child Node4',
          value: '0-1-1',
          key: '0-1-1',
        },
        {
          title: 'Child Node5',
          value: '0-1-2',
          key: '0-1-2',
        },
      ],
    },
  ];
  return (
    <LayoutWrapper>
      <PageHeader>Fotograf Yükleme</PageHeader>
      <TreeSelect
                   treeData={treeData}
                  // onChange={onChangeDealerCode}
                  // treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder={"ürün seçiniz"}
                  showSearch={true}
                  style={{ marginBottom: '8px', width: '250px' }}
                  dropdownMatchSelectWidth	={500}
                  height={600}

                />
      <Box>
        <ContentHolder>
          <Dashboard
            plugins={[]}
            uppy={uppy}
            proudlyDisplayPoweredByUppy={false}
            inline={true}
            target=".DashboardContainer"
            replaceTargetContent={true}
            showProgressDetails={true}
            note="Resim dosyaları, boyutu en fazla 1 MB olmalıdır"
            height={470}
            width="100%"
            metaFields={[
              { id: 'name', name: 'Adı', placeholder: 'Adı giriniz' },
              {
                id: 'caption',
                name: 'Açıklama',
                placeholder: 'Açıklama',
              },
            ]}
            browserBackButtonClose={true}
          />
        </ContentHolder>
      </Box>
    </LayoutWrapper>
  );
};

export default UppyDashboard;
