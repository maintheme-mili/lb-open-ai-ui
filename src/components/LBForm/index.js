import React from 'react';
import {Form, Input, Select, Switch, Checkbox, Row, Col, DatePicker} from "antd";

const {Item} = Form;

const valuePropNameMap = {
    text: 'value',
    select: 'value',
    checkbox: 'checked',
    switch: 'checked',
    rangeDatePicker: 'value'
}

const LBForm = (props) => {
    const {formColumns = [], gutter = 8} = props;
    const [form] = Form.useForm();
    const formProps = {
        form
    };

    return <Form {...formProps}>
        <Row gutter={gutter}>
            {
                formColumns.length ? formColumns.map(item => <Col span={8} {...item.colProps}>
                    <Item name={item.name} valuePropName={valuePropNameMap[item.type]}>
                        {item.type === 'text' && <Input {...item}/>}
                        {item.type === 'select' && <Select {...item} options={item.enum}/>}
                        {item.type === 'checkbox' && <Checkbox.Group {...item} options={item.enum}/>}
                        {item.type === 'switch' && <Switch {...item}/>}
                        {item.type === 'rangeDatePicker' && <DatePicker.RangePicker {...item}/>}
                    </Item>
                </Col>) : null
            }
        </Row>
    </Form>
}

export default LBForm;