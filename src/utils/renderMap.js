// 地图渲染，初始化绘制全国地图配置
let option = {
  backgroundColor: "#000",
  title: {
    text: "下钻至县级",
    subtext: "三级下钻",
    left: "center",
    textStyle: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "normal",
      fontFamily: "Microsoft YaHei",
    },
    subtextStyle: {
      color: "#ccc",
      fontSize: 13,
      fontWeight: "normal",
      fontFamily: "Microsoft YaHei",
    },
  },
  tooltip: {
    trigger: "item",
    formatter: "{b}",
  },
  toolbox: {
    show: true,
    orient: "vertical",
    left: "right",
    top: "center",
    feature: {
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {},
    },
    iconStyle: {
      normal: {
        color: "#fff",
      },
    },
  },
  animationDuration: 1000,
  animationEasing: "cubicOut",
  animationDurationUpdate: 1000,
};
const renderMap = (map, data, charRef) => {
  option.title.subtext = map;
  option.series = [
    {
      name: map,
      type: "map",
      mapType: map,
      roam: false,
      nameMap: {
        china: "中国",
      },
      label: {
        normal: {
          show: true,
          // 名字样式
          textStyle: {
            color: "#C68C5F",
            fontSize: 13,
          },
        },
        emphasis: {
          show: true,
          // 鼠标移入样式
          textStyle: {
            color: "#fff",
            fontSize: 13,
          },
        },
      },
      // 地图背景样式
      itemStyle: {
        normal: {
          areaColor: "#323c48",
          borderColor: "dodgerblue",
        },
        emphasis: {
          areaColor: "darkorange",
        },
      },
      data: data,
    },
  ];
  //渲染地图数据
  charRef.value.setOption(option);
};
export default renderMap;
