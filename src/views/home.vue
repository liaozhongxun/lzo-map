<template>
  <div class="home-page">
    <div class="map-echarts" id="main"></div>
    <div class="map-baidu">
      <baiduMap
        :mapLng="mapLng"
        :mapLat="mapLat"
        :mapZoom="mapZoom"
        :activeCity="activeCity"
      ></baiduMap>
      <!-- :key="new Date().getTime()" -->
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import * as echarts from "echarts";
// 引入百度地图
import baiduMap from "@/components/baiduMap.vue";
// 地区映射对象
import { provincesMap } from "@/utils/provincesmap";
//34个省、市、自治区的名字拼音映射数组
import { cityMap } from "@/utils/citymap";
import { onMounted, reactive, ref } from "vue";

//直辖市和特别行政区-只有二级地图，没有三级地图
const special = ["北京", "天津", "上海", "重庆", "香港", "澳门"];
// 地图数据
let mapdata = [];

// 地图容器
const charRef = ref(null);
// 根据城市获取的经纬度
const mapLng = ref(108.089553);
const mapLat = ref(33.806161);
const mapZoom = ref(5);
const activeCity = ref(null);

// 初始化中国地图
const loadChina = async () => {
  let { data } = await axios.get("/map/china.json");
  // 将加载到的身份数据放到地图数据中
  let prodata = data.features.map((item) => ({ name: item.properties.name }));
  mapdata = [...prodata];
  //注册地图
  echarts.registerMap("china", data);
  //绘制地图
  renderMap("china", prodata);
};

//初始化绘制全国地图配置
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
const renderMap = (map, data) => {
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
          textStyle: {
            color: "#999",
            fontSize: 13,
          },
        },
        emphasis: {
          show: true,
          textStyle: {
            color: "#fff",
            fontSize: 13,
          },
        },
      },
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
  //渲染地图
  charRef.value.clear();
  charRef.value.setOption(option);
};

// 根据城市名称获取经纬度
const getLnglat = async (params) => {
  let { data } = await axios.get(`/baiduApi/geocoding/v3/`, {
    params: {
      address: `${params.seriesName}${params.name}`,
      output: "json",
      // ak: "CtDFZnPIhj7MjWLllGtFNyLpT4MpgGwv",
      ak: "e4bgmoMcHhesd1fZrD2a6VgbQClcpV6z", // 百度地图引用服务端key
    },
  });

  mapLng.value = String(data.result.location.lng);
  mapLat.value = String(data.result.location.lat);
  activeCity.value = params.name;
  console.log(mapLng.value, 888);
};

onMounted(() => {
  console.log(echarts);
  // 地图容器
  charRef.value = echarts.init(document.getElementById("main"));
  // 注册点击事件
  charRef.value.on("click", async (params) => {
    console.log(params);
    // 如果点击的是34个省、市、自治区，绘制选中地区的二级地图
    if (params.name in provincesMap) {
      // 如果点击的 params.name 在身份映射表中，说明这是省
      let { data } = await axios.get(
        `/map/province/${provincesMap[params.name]}.json`
      );
      // console.log(data);

      echarts.registerMap(params.name, data);
      renderMap(
        params.name,
        data.features.map((item) => ({ name: item.properties.name }))
      );
    } else if (params.seriesName in provincesMap) {
      // 如果点击的 params.seriesName 上级名称在身份映射表中，说明这是市
      if (special.includes(params.seriesName)) {
        // 如果是【直辖市/特别行政区】只有二级下钻
        // renderMap("china", mapdata);
        getLnglat(params);
      } else {
        //显示县级地图
        let { data } = await axios.get(
          `/map/city/${cityMap[params.name]}.json`
        );

        echarts.registerMap(params.name, data);
        renderMap(
          params.name,
          data.features.map((item) => ({ name: item.properties.name }))
        );
      }
    } else {
      // console.log(params);
      getLnglat(params);
      // renderMap("china", mapdata);
    }
  });
  // 注册双击返回事件
  charRef.value.on("dblclick", () => {
    renderMap("china", mapdata);
  });
  loadChina();
});
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  .map-echarts {
    flex: 1;
  }
  .map-baidu {
    flex: 1;
  }
}
</style>
