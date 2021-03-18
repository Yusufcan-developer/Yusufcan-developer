import React from "react";
import ReactSpeedometer from "react-d3-speedometer"
import { SingleCardWrapper } from '../Products/Shuffle.styles';
import gaugeConfig from "@iso/config/gaugeConfig";
import { Tag } from "antd";
import numberFormat from "@iso/config/numberFormat";
import viewType from '@iso/config/viewType';

export default (props) => {
    let name = null;
    let customSegment;
    let segmentColors;
    let segmentCount;
    let actualTry;
    let goalTry;
    let calculatedRatio;
    let calculatedRatioText = ''

    const { value, item } = props;
    const listClass = `isoSingleCard card grid`;
    const style = { zIndex: 100 - 90 };

    if ((item === 'KARO') && (value.isVisibleKaro)) {
        name = 'KARO';
        actualTry = value.actualKaroTry;
        goalTry = value.goalKaroTry;
        calculatedRatio = value.calculatedRatioKaro * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (calculatedRatio < 0) { calculatedRatio = 0 }
        else if (calculatedRatio > 100) { calculatedRatio = 100 }

        if (value.thresholdRatio1Karo === value.thresholdRatio1Karo) {
            customSegment = [0, value.thresholdRatio1Karo, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Karo, value.thresholdRatio2Karo, 100] }
    }
    else if ((item === 'YAPIKIMYASALI') && (value.isVisibleYapiKimyasal)) {
        name = 'YAPI KİMYASALI';
        actualTry = value.actualYapiKimyasalTry;
        goalTry = value.goalYapiKimyasalTry;
        calculatedRatio = value.calculatedRatioYapiKimyasal * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (value.thresholdRatio1YapiKimyasal === value.thresholdRatio2YapiKimyasal) {
            customSegment = [0, value.thresholdRatio1YapiKimyasal, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1YapiKimyasal, value.thresholdRatio2YapiKimyasal, 100] }

    }
    else if ((item === 'VITRIFIYE') && (value.isVisibleVitrifiye)) {
        name = 'VİTFİFİYE';
        actualTry = value.actualVitrifiyeTry;
        goalTry = value.goalVitrifiyeTry;
        calculatedRatio = value.calculatedRatioVitrifiye * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (value.thresholdRatio1Vitrifiye === value.thresholdRatio2Vitrifiye) {
            customSegment = [0, value.thresholdRatio1Vitrifiye, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Vitrifiye, value.thresholdRatio2Vitrifiye, 100] }

    }
    else if ((item === 'BANYOMOBILYASI') && (value.isVisibleBanyoMobilyalari)) {
        name = 'BANYO MOBİLYASI';
        actualTry = value.actualBanyoMobilyalariTry;
        goalTry = value.goalBanyoMobilyalariTry;
        calculatedRatio = value.calculatedRatioBanyoMobilyalari * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (value.thresholdRatio1BanyoMobilyalari === value.thresholdRatio2BanyoMobilyalari) {
            customSegment = [0, value.thresholdRatio1BanyoMobilyalari, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1BanyoMobilyalari, value.thresholdRatio2BanyoMobilyalari, 100] }

    }
    else if ((item === 'KAMPANYA') && (value.isVisibleKampanya)) {
        name = 'KAMPANYA';
        actualTry = value.actualKampanyaTry;
        goalTry = value.goalKampanyaTry;
        calculatedRatio = value.calculatedRatioKampanya * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (value.thresholdRatio1Kampanya === value.thresholdRatio2Kampanya) {
            customSegment = [0, value.thresholdRatio1Kampanya, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Kampanya, value.thresholdRatio2Kampanya, 100] }

    }
    else if ((item === 'KAMPANYA2') && (value.isVisibleKampanya2)) {
        name = 'KAMPANYA2';
        actualTry = value.actualKampanya2Try;
        goalTry = value.goalKampanya2Try;
        calculatedRatio = value.calculatedRatioKampanya2 * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (value.thresholdRatio1Kampanya2 === value.thresholdRatio2Kampanya2) {
            customSegment = [0, value.thresholdRatio1Kampanya2, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Kampanya2, value.thresholdRatio2Kampanya2, 100] }

    }
    else if ((item === 'TOPLAM') && (value.isVisibleToplam)) {
        name = 'TOPLAM';
        actualTry = value.actualToplamTry;
        goalTry = value.goalToplamTry;
        calculatedRatio = value.calculatedRatioToplam * 100;
        calculatedRatioText = numberFormat(calculatedRatio.toString());
        if (value.thresholdRatio1Toplam === value.thresholdRatio2Toplam) {
            customSegment = [0, value.thresholdRatio1Toplam, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Toplam, value.thresholdRatio2Toplam, 100] }
    }
    const filterView = viewType('Filter');
    return (
        <React.Fragment>
            {name !== null ?
                <SingleCardWrapper className={listClass} style={style} xs={{ span: 12 }} sm={{ span: 12 }} lg={{ span: 6 }} >
                    <span style={{ fontWeight: 'bold', fontSize: '120%', marginLeft: '2px' }}>
                        <Tag color={'#5D79C2'} key={false}>
                            {name}
                        </Tag>
                    </span>
                    <div style={{ margin: filterView !== 'MobileView' ? 'auto' : 'auto' }}>
                        <ReactSpeedometer
                            width={filterView !== 'MobileView' ? 300 : 300}
                            height={250}
                            needleHeightRatio={0.8}
                            value={calculatedRatio}
                            customSegmentStops={customSegment}
                            segmentColors={segmentColors}

                            currentValueText={'% ' + calculatedRatioText}
                            maxValue={100}
                            segments={segmentCount}
                            valueTextFontWeight={'bold'}
                            valueTextFontSize={'25px'}

                            ringWidth={47}
                            needleTransitionDuration={3333}
                            needleTransition="easeElastic"
                            needleColor={'#90f2ff'}
                        /></div>
                    {value.isVisibleTryValues === false ?
                        <React.Fragment>
                            <div style={{ textAlign: 'center', minHeight: '35px' }}><span style={{ fontWeight: 'bold' }}> Gerçekleşen: </span>{numberFormat(actualTry)} {"TL"}
                            </div>
                            <div style={{ textAlign: 'center', minHeight: '35px' }}><span style={{ fontWeight: 'bold' }}> Hedef: </span>{numberFormat(goalTry)} {"TL"}
                            </div></React.Fragment> : null}

                </SingleCardWrapper> : null}
        </React.Fragment>
    );
}