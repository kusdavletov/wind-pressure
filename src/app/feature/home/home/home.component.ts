import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

import { MatTableDataSource } from '@angular/material/table';

import { WindPressureModel } from '@core/model/wind-pressure.model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({
              height: 0,
              opacity: 0
            }),
            animate('1s ease-out',
              style({
                height: 300,
                opacity: 1
              }))
          ]
        ),
        transition(
          ':leave',
          [
            style({
              height: 300,
              opacity: 1
            }),
            animate('1s ease-in',
              style({
                height: 0,
                opacity: 0
              }))
          ]
        )
      ]
    )
  ]
})
export class HomeComponent implements OnInit {

  readonly pageSize = 15;
  readonly pageSizeOptions = [5, 10, 15];
  readonly displayedColumns = [
    {
      name: 'areaId',
      displayName: 'Номер участка',
      sortable: true,
    },
    {
      name: 'coefK',
      displayName: 'Коэф. к',
      sortable: true,
    },
    {
      name: 'coefC',
      displayName: 'Коэф. с',
      sortable: true,
    },
    {
      name: 'windPressure',
      displayName: 'Ветряное давление (кг/м2)',
      sortable: true,
    },
  ];

  dataSource = new MatTableDataSource<WindPressureModel>([]);

  readonly roofTypes = [
    {
      viewValue: 'Плоское',
      value: 1
    },
    // {
    //   viewValue: 'Односкатное',
    //   value: 2
    // },
    {
      viewValue: 'Двускатное',
      value: 3
    },
  ];

  readonly windDirections = [
    {
      viewValue: 'A',
      value: 1
    },
    {
      viewValue: 'B',
      value: 2
    },
  ];

  readonly windAreas = [
    {
      viewValue: '0. 17 кг/м2, 0.17 кПа',
      value: 17
    },
    {
      viewValue: 'I. 23 кг/м2, 0.23 кПа',
      value: 23
    },
    {
      viewValue: 'II. 30 кг/м2, 0.30 кПа',
      value: 30
    },
    {
      viewValue: 'III. 38 кг/м2, 0.38 кПа',
      value: 38
    },
    {
      viewValue: 'IV. 48 кг/м2, 0.48 кПа',
      value: 48
    },
    {
      viewValue: 'V. 60 кг/м2, 0.60 кПа',
      value: 60
    },
    {
      viewValue: 'VI. 73 кг/м2, 0.73 кПа',
      value: 73
    },
    {
      viewValue: 'VII. 85 кг/м2, 0.85 кПа',
      value: 85
    },
  ];

  readonly areaTypes = [
    {
      viewValue: 'I. Открытые побережья морей, озер и водохранилищ, сельские местности, в том числе с постройками ' +
        'высотой менее 10 м, пустыни, степи, лесостепи, тундра',
      value: 1
    },
    {
      viewValue: 'II. Городские территории, лесные массивы и другие местности, равномерно покрытые препятствиями ' +
        'высотой более 10 м',
      value: 2
    },
    {
      viewValue: 'III. Городские районы с плотной застройкой зданиями высотой более 25 м',
      value: 3
    },
  ];


  form = this.fb.group({
    roofType: [3, Validators.required],
    windArea: [30, Validators.required],
    areaType: [1, Validators.required],
    windDirection: [1, Validators.required],
    height: [0, Validators.required],
    width: [0, Validators.required],
    length: [0, Validators.required],
    heightRoof: [0, Validators.nullValidator]
  });

  constructor(private fb: FormBuilder,
              @Inject(DOCUMENT) private document: Document) {

  }

  ngOnInit(): void {}

  calculate(
    roofType: number,
    windDirection: number,
    windArea: number,
    areaType: number,
    height: number,
    width: number,
    length: number,
    heightRoofOpt?: number): WindPressureModel[] {
    const heightBase = height - (heightRoofOpt ? heightRoofOpt : 0);
    let alfa;
    let k10;
    let e10;
    let e;
    const b = [0, 0];
    const d = [0, 0];
    let ze: number[] = [0, 0, 0];
    const k: number[] =   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const c: any[] =   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const c1: number[] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const c2: number[] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const v: any[] =   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const v1: number[] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const v2: number[] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (areaType === 1) {
      alfa = 0.15;
      k10 = 1;
      e10 = 0.76;
    } else if (areaType === 2) {
      alfa = 0.2;
      k10 = 0.65;
      e10 = 1.06;
    } else {
      alfa = 0.25;
      k10 = 0.4;
      e10 = 1.78;
    }
    if (roofType === 1) {
      if (windDirection === 1) {
        if (height <= width) {
          ze = [height, height, height];
        } else if ((height > width) && (height <= 2 * width)) {
          ze = [width, height, height];
        } else if (height > 2 * width) {
          ze = [width, height - width, height];
        }
        k[0] = k[3] = k[4] = k[5] = k[12] = (k10 * Math.pow(ze[0] / 10000, 2 * alfa));
        k[1] = k[6] = k[7] = k[8] = k[13] = (k10 * Math.pow(ze[1] / 10000, 2 * alfa));
        k[2] = k[9] = k[10] = k[11] = k[14] = (k10 * Math.pow(ze[2] / 10000, 2 * alfa));
        c[0] = c[1] = c[2] = 0.8;
        c[3] = c[6] = c[9] = -1;
        c[4] = c[7] = c[10] = -0.8;
        c[5] = c[8] = c[11] = -0.5;
        c[12] = c[13] = c[14] = -0.5;
        v[0] = (windArea * k[0] * c[0] * 1.4);
        v[1] = (windArea * k[1] * c[1] * 1.4);
        v[2] = (windArea * k[2] * c[2] * 1.4);
        v[3] = (windArea * k[3] * c[3] * 1.4);
        v[4] = (windArea * k[4] * c[4] * 1.4);
        v[5] = (windArea * k[5] * c[5] * 1.4);
        v[6] = (windArea * k[6] * c[6] * 1.4);
        v[7] = (windArea * k[7] * c[7] * 1.4);
        v[8] = (windArea * k[8] * c[8] * 1.4);
        v[9] = (windArea * k[9] * c[9] * 1.4);
        v[10] = (windArea * k[10] * c[10] * 1.4);
        v[11] = (windArea * k[11] * c[11] * 1.4);
        v[12] = (windArea * k[12] * c[12] * 1.4);
        v[13] = (windArea * k[13] * c[13] * 1.4);
        v[14] = (windArea * k[14] * c[14] * 1.4);

        e = Math.min(width, 2 * height);
        b[0] = e / 5;
        b[1] = e;
      } else if (windDirection === 2) {
        if (height <= length) {
          ze = [height, height, height];
        } else if ((height > length) && (height <= 2 * length))  {
          ze = [length, height, height];
        } else if (height > 2 * length) {
          ze = [length, height - length, height];
        }

        k[0] = k[3] = k[4] = k[5] = k[12] = (k10 * Math.pow(ze[0] / 10000, 2 * alfa));
        k[1] = k[6] = k[7] = k[8] = k[13] = (k10 * Math.pow(ze[1] / 10000, 2 * alfa));
        k[2] = k[9] = k[10] = k[11] = k[14] = (k10 * Math.pow(ze[2] / 10000, 2 * alfa));
        c[0] = c[1] = c[2] = 0.8;
        c[3] = c[6] = c[9] = -1;
        c[4] = c[7] = c[10] = -0.8;
        c[5] = c[8] = c[11] = -0.5;
        c[12] = c[13] = c[14] = -0.5;
        v[0] = (windArea * k[0] * c[0] * 1.4);
        v[1] = (windArea * k[1] * c[1] * 1.4);
        v[2] = (windArea * k[2] * c[2] * 1.4);
        v[3] = (windArea * k[3] * c[3] * 1.4);
        v[4] = (windArea * k[4] * c[4] * 1.4);
        v[5] = (windArea * k[5] * c[5] * 1.4);
        v[6] = (windArea * k[6] * c[6] * 1.4);
        v[7] = (windArea * k[7] * c[7] * 1.4);
        v[8] = (windArea * k[8] * c[8] * 1.4);
        v[9] = (windArea * k[9] * c[9] * 1.4);
        v[10] = (windArea * k[10] * c[10] * 1.4);
        v[11] = (windArea * k[11] * c[11] * 1.4);
        v[12] = (windArea * k[12] * c[12] * 1.4);
        v[13] = (windArea * k[13] * c[13] * 1.4);
        v[14] = (windArea * k[14] * c[14] * 1.4);
        e = Math.min(length, 2 * height);
        d[0] = e / 5;
        d[1] = e;
      }
      const windPressures: WindPressureModel[] = [];
      for (let i = 0; i < 15; ++ i) {
        windPressures.push({
          windPressure: v[i],
          coefK: k[i],
          coefC: c[i],
          areaId: i + 1
        });
      }
      return windPressures;
    } else if (roofType === 2) {

    } else {
      const angle = Math.atan((height - heightBase) / (width / 2)) / Math.PI * 180;
      if (windDirection === 1) {
        ze[2] = height;
        k[0] = k[1] = k[2] = k[3] = (k10 * Math.pow(ze[2] / 10000, 2 * alfa));

        if ((angle >= 0) && (angle < 7.5)) {
          alert('Внимание. Пологая крыша.');
          c[0] = -1.8;
          c[1] = -1.3;
          c[2] = -0.7;
          c[3] = -0.5;
        }
        if ((angle >= 7.5) && (angle < 22.5)) {
          c[0] = -1.3;
          c[1] = -1.3;
          c[2] = -0.6;
          c[3] = -0.5;
        }
        if ((angle >= 22.5) && (angle < 37.5)) {
          c[0] = -1.1;
          c[1] = -1.4;
          c[2] = -0.8;
          c[3] = -0.5;
        }
        if ((angle >= 37.5) && (angle < 52.5)) {
          c[0] = -1.1;
          c[1] = -1.4;
          c[2] = -0.9;
          c[3] = -0.5;
        }
        if ((angle >= 52.5) && (angle < 67.5)) {
          c[0] = -1.1;
          c[1] = -1.2;
          c[2] = -0.8;
          c[3] = -0.5;
        }
        if ((angle >= 67.5) && (angle < 90)) {
          alert('Внимание. Очень острая крыша.');
          c[0] = -1.1;
          c[1] = -1.2;
          c[2] = -0.8;
          c[3] = -0.5;
        }
        if (angle >= 90) {
          alert('Ошибка. Угол крыши 90 и более градусов. Проверьте введенные данные.');
        }
        if (angle < 0) {
          alert('Ошибка. Угол крыши меньше 0 градусов. Проверьте введенные данные.');
        }


        v[0] = (windArea * k[0] * c[0] * 1.4);
        v[1] = (windArea * k[1] * c[1] * 1.4);
        v[2] = (windArea * k[2] * c[2] * 1.4);
        v[3] = (windArea * k[3] * c[3] * 1.4);

        e = Math.min(width, 2 * height);
        b[0] = e / 10;
        b[1] = e / 2;
        d[0] = e / 4;
        const windPressures: WindPressureModel[] = [];
        for (let i = 0; i < 4; ++ i) {
          windPressures.push({
            windPressure: v[i],
            coefK: k[i],
            coefC: c[i],
            areaId: i + 1
          });
        }
        return windPressures;
      } else if (windDirection === 2) {
        ze[2] = height;
        k[0] = k[1] = k[2] = k[3] = k[4] = (k10 * Math.pow(ze[2] / 10000, 2 * alfa));

        if ((angle >= 0) && (angle < 7.5)) {
          alert('Внимание. Пологая крыша.');
          c[0] = -1.8;
          c[1] = -1.3;
          c[2] = -0.7;
          c[3] = c[4] = -0.5;
        }
        if ((angle >= 7.5) && (angle < 22.5)) {
          c1[0] = -0.9;
          c2[0] = 0.2;
          c[0] = 'от ' + c1[0] + ' до ' + c2[0];
          c1[1] = -0.8;
          c2[1] = 0.2;
          c[1] = 'от ' + c1[1] + ' до ' + c2[1];
          c1[2] = -0.3;
          c2[2] = 0.2;
          c[2] = 'от ' + c1[2] + ' до ' + c2[2];
          c[3] = -1;
          c[4] = -0.4;
        }
        if ((angle >= 22.5) && (angle < 37.5)) {
          c1[0] = -0.5;
          c2[0] = 0.7;
          c[0] = 'от ' + c1[0] + ' до ' + c2[0];
          c1[1] = -0.5;
          c2[1] = 0.7;
          c[1] = 'от ' + c1[1] + ' до ' + c2[1];
          c1[2] = -0.2;
          c2[2] = 0.4;
          c[2] = 'от ' + c1[2] + ' до ' + c2[2];
          c[3] = -0.5;
          c[4] = -0.4;
        }
        if ((angle >= 37.5) && (angle < 52.5)) {
          c[0] = 0.7;
          c[1] = 0.7;
          c[2] = 0.6;
          c[3] = -0.3;
          c[4] = -0.2;
        }
        if ((angle >= 52.5) && (angle < 67.5)) {
          c[0] = 0.7;
          c[1] = 0.7;
          c[2] = 0.7;
          c[3] = -0.3;
          c[4] = -0.2;
        }
        if ((angle >= 67.5) && (angle < 90)) {
          alert('Внимание. Очень острая крыша.');
          c[0] = 0.8;
          c[1] = 0.8;
          c[2] = 0.8;
          c[3] = -0.3;
          c[4] = -0.2;
        }
        if (angle >= 90) {
          alert('Ошибка. Угол крыши 90 и более градусов. Проверьте введенные данные.');
        } else if (angle < 0) {
          alert('Ошибка. Угол крыши меньше 0 градусов. Проверьте введенные данные.');
        } else if ((angle >= 7.5) && (angle < 37.5)) {
          v1[0] = (windArea * k[0] * c1[0] * 1.4);
          v2[0] = (windArea * k[0] * c2[0] * 1.4);
          v1[1] = (windArea * k[1] * c1[1] * 1.4);
          v2[1] = (windArea * k[1] * c2[1] * 1.4);
          v1[2] = (windArea * k[2] * c1[2] * 1.4);
          v2[2] = (windArea * k[2] * c2[2] * 1.4);
          v[0] = 'от ' + v1[0] + ' до ' + v2[0];
          v[1] = 'от ' + v1[1] + ' до ' + v2[1];
          v[2] = 'от ' + v1[2] + ' до ' + v2[2];
          v[3] = (windArea * k[3] * c[3] * 1.4);
          v[4] = (windArea * k[4] * c[4] * 1.4);
        } else {
          v[0] = (windArea * k[0] * c[0] * 1.4);
          v[1] = (windArea * k[1] * c[1] * 1.4);
          v[2] = (windArea * k[2] * c[2] * 1.4);
          v[3] = (windArea * k[3] * c[3] * 1.4);
          v[4] = (windArea * k[4] * c[4] * 1.4);
        }

        e = Math.min(width, 2 * height);
        d[0] = e / 10;
        b[0] = e / 4;
        const windPressures: WindPressureModel[] = [];
        for (let i = 0; i < 5; ++ i) {
          windPressures.push({
            windPressure: v[i],
            coefK: k[i],
            coefC: c[i],
            areaId: i + 1
          });
        }
        return windPressures;
      }
    }
    return [];
  }

  onSubmit(form: FormGroup): void {
    if (form.invalid) {
      return;
    }
    if (this.form.value.height < 0
        || this.form.value.width < 0
        || this.form.value.length < 0
        || this.form.value.heightRoof < 0) {
      alert('Значения не могут быть меньше 0');
      return;
    }
    const calculated = this.calculate(
        this.form.value.roofType,
        this.form.value.windDirection,
        this.form.value.windArea,
        this.form.value.areaType,
        this.form.value.height,
        this.form.value.width,
        this.form.value.length,
        this.form.value.heightRoof
    );
    this.dataSource.data = calculated;
    const element = this.document.querySelector('#result');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  onRoofTypeChanged(event: Event): void {
    if (Number(event) === 1) {
      this.form.controls.heightRoof.setValue(0);
      this.form.controls.heightRoof.disable();
    } else {
      this.form.controls.heightRoof.enable();
    }
  }
}
