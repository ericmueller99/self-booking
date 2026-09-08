import React from 'react';
import {useForm} from 'react-hook-form';
import {
    txtInputTailwindClasses,
    formTailwindClasses,
    labelTailwindClasses,
    formHolderTailwindClasses, txtInputHolderTailwindClasses, buttonTailwindClasses
} from "../lib/form-helpers";

export function BasicForm({stateSetter, firstName, lastName, emailAddress, phoneNumber, options = {}}) {

    //options
    const {buttonText = 'Submit', formClasses = formTailwindClasses(), textInputClasses = txtInputTailwindClasses(), labelClasses = labelTailwindClasses(),
        formHolderClasses = formHolderTailwindClasses(), textInputHolderClasses = txtInputHolderTailwindClasses(), buttonClasses = buttonTailwindClasses()
    } = options;

    //state management
    const [isLoading, setIsLoading] = React.useState(false);
    const {register, handleSubmit, formState: {errors}, setError} = useForm({
        defaultValues: {
            firstName,
            lastName,
            emailAddress,
            phoneNumber
        }
    });

    //submit the form.
    const onSubmit = (data) => {
        if (stateSetter && typeof stateSetter === 'function') {
            data = {...data, result: true};
            stateSetter(data);
        }
        else {
            console.log('unable to set state.  stateSetter is not a function');
            console.log('form state is:');
            console.log(data);
        }
    }

    return (
        <div className={formHolderClasses}>

            {/*Loading Widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 500}}>
                    <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
                </div>
                <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
            </div>

            {/*Form*/}
            <form className={formClasses} onSubmit={handleSubmit(onSubmit)}>

                {/* First Name */}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"firstName"} className={labelClasses}>*First Name</label>
                    <input type={"text"} {...register('firstName', {required: true, maxLength: 50})} className={textInputClasses} title="First Name" />
                    {errors.firstName && <p className={"text-red-600"}>First name is required.</p> }
                </div>

                {/* Last Name */}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"lastName"} className={labelClasses}>*Last Name</label>
                    <input type={"text"} {...register('lastName', {required: true, maxLength: 50})} className={textInputClasses} title="Last Name" />
                    {errors.lastName && <p className={"text-red-600"}>Last name is required.</p> }
                </div>

                {/*Email Address*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"emailAddress"} className={labelClasses}>*Email Address</label>
                    <input type={"text"} {...register('emailAddress', {pattern: /\S+@\S+\.\S+/, required: true})} className={textInputClasses} title="Email Address" />
                    {errors.emailAddress && <p className={"text-red-600"}>Email address is not valid.</p>}
                </div>

                {/*Phone Number*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"phoneNumber"} className={labelClasses}>*Phone Number</label>
                    <input type={"text"} {...register('phoneNumber', {pattern: /^(0|[1-9]\d*)(\.\d+)?$/,required: true, maxLength: 20, minLength:10})} className={textInputClasses} title="Phone Number" />
                    {errors.phoneNumber && <p className={"text-red-600"}>Phone number is not valid.</p> }
                </div>

                <div className={"col-span-2 flex justify-end"}>
                    <button type={"submit"} className={buttonClasses}>
                        {buttonText}
                    </button>
                </div>


            </form>

        </div>
    )

}