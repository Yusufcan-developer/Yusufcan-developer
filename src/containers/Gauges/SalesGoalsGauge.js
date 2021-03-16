import React from "react";
import ReactSpeedometer from "react-d3-speedometer"
import { SingleCardWrapper } from '../Products/Shuffle.styles';
import gaugeConfig from "@iso/config/gaugeConfig";
import { Tag } from "antd";
import numberFormat from "@iso/config/numberFormat";

export default (props) => {
    let name = null;
    let customSegment;
    let segmentColors;
    let segmentCount;
    let actualTry;
    let goalTry;
    let calculateValue;

    const { value, item } = props;
    const listClass = `isoSingleCard card grid`;
    const style = { zIndex: 100 - 90 };

    if ((item === 'KARO') && (value.isVisibleKaro)) {
        name = 'KARO';
        actualTry = value.actualKaroTry;
        goalTry = value.goalKaroTry;
        calculateValue=value.calculatedRatioKaro;

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
        calculateValue=value.calculatedRatioYapiKimyasal;

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
        calculateValue=value.calculatedRatioVitrifiye;

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
        calculateValue=value.calculatedRatioBanyoMobilyalari;

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
        calculateValue=value.calculatedRatioKampanya;

        if (value.thresholdRatio1Kampanya === value.thresholdRatio2Kampanya) {
            customSegment = [0, value.thresholdRatio1Kampanya, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Kampanya, value.thresholdRatio2Kampanya, 100] }

    }
    else if ((item === 'TOPLAM') && (value.isVisibleToplam)) {
        name = 'TOPLAM';
        actualTry = value.actualToplamTry;
        goalTry = value.goalToplamTry;
        calculateValue=value.calculatedRatioToplam;

        if (value.thresholdRatio1Toplam === value.thresholdRatio2Toplam) {
            customSegment = [0, value.thresholdRatio1Toplam, 100]
            segmentCount = gaugeConfig.segment2Count;
            segmentColors = gaugeConfig.segment2Colors;
        }
        else { segmentColors = gaugeConfig.segment3Colors; segmentCount = gaugeConfig.segment3Count; customSegment = [0, value.thresholdRatio1Toplam, value.thresholdRatio2Toplam, 100] }
    }
        return (

        <React.Fragment>
            {name !== null ?
                <SingleCardWrapper className={listClass} style={style} xs={{ span: 12 }} sm={{ span: 12 }} lg={{ span: 6 }} >
                    <span style={{ fontWeight: 'bold', fontSize: '120%', marginLeft:'2px'}}>
                        <Tag color={'#5D79C2'} key={false}>
                            {name}
                        </Tag>
                    </span>
                    <div style={{marginLeft:'20px'}}>
                    <ReactSpeedometer
                        width={350}
                        height={250}
                        needleHeightRatio={0.8}
                        value={calculateValue}
                        customSegmentStops={customSegment}
                        segmentColors={segmentColors}

                        currentValueText={"% ${value}"}
                        maxValue={100}
                        segments={segmentCount}
                        valueTextFontWeight={'bold'}
                        valueTextFontSize={'25px'}

                        ringWidth={47}
                        needleTransitionDuration={3333}
                        needleTransition="easeElastic"
                        needleColor={'#90f2ff'}
                    /></div>
                    {value.isVisibleTryValues === true ?
                        <React.Fragment>
                            <div className="isoCardTitle" style={{ textAlign: 'center', minHeight: '50px', fontWeight: 'bold' }}>{'Gerçekleşen: ' + numberFormat(actualTry)} {"TL"}
                            </div>
                            <div className="isoCardTitle" style={{ textAlign: 'center', minHeight: '80px', fontWeight: 'bold' }}>{'Hedef: ' + numberFormat(goalTry)} {"TL"}
                            </div></React.Fragment> : null}

                </SingleCardWrapper> : null}
        </React.Fragment>
    );
}