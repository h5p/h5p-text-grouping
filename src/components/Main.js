import React from 'react';
import Category from './category/Category';
import CategoryList from './category-list/CategoryList';
import './Main.scss';
import TextItem from './text-item/TextItem';

/**
 * A component that defines the top-level layout and
 * functionality.
 * @param {object} context
 * @returns the main content to be displayed
 */
export default function Main(context) {
  // Dummy return statement
  const categories = [
    <Category key='category1' title='Category 1'><TextItem/><TextItem/><TextItem/></Category>,
    <Category key='category2' title='Category 2'><TextItem/><TextItem/></Category>,
    <Category key='category3' title='Category 3'><TextItem/><TextItem/><TextItem/></Category>,
    <Category key='category4' title='Category 4'><TextItem/><TextItem/></Category>
  ];
  return (
    <CategoryList title="Categories" categories={categories}/>
  );
}
