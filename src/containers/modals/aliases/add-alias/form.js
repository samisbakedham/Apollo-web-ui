import React from 'react';

import CustomFormSelect from '../../../components/form-components/custom-form-select';
import NumericInputComponent from '../../../components/form-components/numeric-input';
import TextualInputComponent from '../../../components/form-components/textual-input';
import AccountRSFormInput from '../../../components/form-components/account-rs';

const aliasTypeData = [
    { value: 'uri',     label: 'URI' },
    { value: 'account', label: 'Account' },
    { value: 'general', label: 'Other' },
];


class AddAliasForm extends React.Component {
    state = {inputType: 'uri'};

    handleChange = (value) => {
        this.setState({
            inputType: value
        })
    };

    render () {
        const {setValue} = this.props;

        return (
            <>
                <CustomFormSelect
                    defaultValue={aliasTypeData[0]}
                    setValue={setValue}
                    options={aliasTypeData}
                    label={'Type'}
                    field={'type'}
                    onChange={this.handleChange}
                />
        
                <NumericInputComponent
                    setValue={setValue}
                    label={'Alias'}
                    field={'aliasName'}
                    countingTtile={''}
                    placeholder={'Alias name'}
                    type={'tel'}
                />
              
                {
                    this.state.inputType === 'uri' &&
                    <TextualInputComponent 
                        label={'URI'}
                        field="aliasURI"
                        placeholder="http://"
                        type={"text"}
                        setValue={setValue}
                    />
                }
                {
                    this.state.inputType === 'account' &&
                    <AccountRSFormInput
                        field={'aliasURI'}
                        label={'Account ID'}
                        setValue={setValue}
                    />
                }
                {
                    this.state.inputType === 'general' &&
                    <TextualInputComponent 
                        label={'Data'}
                        field="aliasURI"
                        placeholder="Data"
                        type={"text"}
                        setValue={setValue}
                    />
                }
            </>
        )
    }
}

export default AddAliasForm;