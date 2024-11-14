import React from 'react';
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

import './Employees.css';

const Employees = ({ employees }) => {
  const deleteEmployee = ( id ) => {
    employees = employees.filter( employee => employee.id !== id );
};

    return (
      <div className="Employees">
        {employees?.map((employee, index) => (
          <div className="employee" key={index}>
            <div className='name'>
              <img className="avatar" src={require("./images/avatar.png")} alt="avatar" />
              <p>{employee.name}</p>
            </div>
            <p className="age">
              {employee.age}
            </p>
            <p className="position">
              {employee.position}
            </p>
            <div className="actions">
              <FaRegTrashCan onClick={deleteEmployee( employee.id )} />
              <FaEdit />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  export default Employees;